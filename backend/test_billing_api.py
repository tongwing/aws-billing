#!/usr/bin/env python3
"""
Standalone script to test AWS Cost Explorer API using credentials from .env file.
This script helps diagnose billing data retrieval issues.
"""

import os
import sys
import boto3
from datetime import datetime, timedelta
from botocore.exceptions import ClientError, NoCredentialsError
from dotenv import load_dotenv

def load_environment():
    """Load environment variables from .env file"""
    env_path = os.path.join(os.path.dirname(__file__), 'backend', '.env')
    if os.path.exists(env_path):
        load_dotenv(env_path)
        print(f"✓ Loaded environment from {env_path}")
    else:
        print(f"⚠️  No .env file found at {env_path}")
        print("Looking for AWS credentials in environment variables or AWS profile...")
    
    return {
        'aws_access_key_id': os.getenv('AWS_ACCESS_KEY_ID'),
        'aws_secret_access_key': os.getenv('AWS_SECRET_ACCESS_KEY'),
        'aws_region': os.getenv('AWS_REGION', 'us-east-1')
    }

def create_cost_explorer_client(config):
    """Create and configure AWS Cost Explorer client"""
    try:
        if config['aws_access_key_id'] and config['aws_secret_access_key']:
            print(f"Using explicit credentials for region: {config['aws_region']}")
            client = boto3.client(
                'ce',
                aws_access_key_id=config['aws_access_key_id'],
                aws_secret_access_key=config['aws_secret_access_key'],
                region_name=config['aws_region']
            )
        else:
            print(f"Using default credential chain for region: {config['aws_region']}")
            client = boto3.client('ce', region_name=config['aws_region'])
        
        return client
    except Exception as e:
        print(f"❌ Failed to create Cost Explorer client: {e}")
        return None

def test_credentials(client):
    """Test if credentials are valid by making a simple API call"""
    print("\n🔐 Testing AWS credentials...")
    
    try:
        # Try to get dimension values for a small date range
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=7)
        
        response = client.get_dimension_values(
            TimePeriod={
                'Start': start_date.strftime('%Y-%m-%d'),
                'End': end_date.strftime('%Y-%m-%d')
            },
            Dimension='SERVICE'
        )
        
        services = [item['Value'] for item in response.get('DimensionValues', [])]
        print(f"✓ Credentials valid! Found {len(services)} services in the last 7 days")
        if services:
            print(f"  Sample services: {', '.join(services[:5])}")
        
        return True
        
    except ClientError as e:
        error_code = e.response['Error']['Code']
        error_message = e.response['Error']['Message']
        print(f"❌ AWS API Error: {error_code}")
        print(f"   Message: {error_message}")
        
        if error_code == 'TokenRefreshRequired':
            print("   → AWS credentials are expired. Please refresh your credentials.")
        elif error_code == 'UnauthorizedOperation':
            print("   → AWS credentials lack Cost Explorer permissions.")
        elif error_code == 'InvalidUserID.NotFound':
            print("   → AWS credentials are invalid or user not found.")
        
        return False
        
    except NoCredentialsError:
        print("❌ No AWS credentials found!")
        print("   → Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in backend/.env")
        return False
        
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def get_cost_data(client, days=30):
    """Retrieve cost data for the specified number of days"""
    print(f"\n💰 Retrieving cost data for the last {days} days...")
    
    try:
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days)
        
        response = client.get_cost_and_usage(
            TimePeriod={
                'Start': start_date.strftime('%Y-%m-%d'),
                'End': end_date.strftime('%Y-%m-%d')
            },
            Granularity='DAILY',
            Metrics=['BlendedCost']
        )
        
        results = response.get('ResultsByTime', [])
        print(f"✓ Retrieved {len(results)} daily cost records")
        
        if results:
            total_cost = 0
            for result in results:
                if 'Total' in result and 'BlendedCost' in result['Total']:
                    amount = float(result['Total']['BlendedCost']['Amount'])
                    total_cost += amount
                    date = result['TimePeriod']['Start']
                    print(f"  {date}: ${amount:.2f}")
            
            print(f"\n📊 Summary:")
            print(f"   Total cost ({days} days): ${total_cost:.2f}")
            print(f"   Average daily cost: ${total_cost/len(results):.2f}")
        else:
            print("⚠️  No cost data found for the specified period")
            print("   This might be normal if your AWS account has no recent usage")
        
        return True
        
    except ClientError as e:
        print(f"❌ Failed to retrieve cost data: {e.response['Error']['Message']}")
        return False
        
    except Exception as e:
        print(f"❌ Unexpected error retrieving cost data: {e}")
        return False

def get_cost_by_service(client, days=7):
    """Get cost breakdown by service"""
    print(f"\n🔧 Getting cost breakdown by service (last {days} days)...")
    
    try:
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days)
        
        response = client.get_cost_and_usage(
            TimePeriod={
                'Start': start_date.strftime('%Y-%m-%d'),
                'End': end_date.strftime('%Y-%m-%d')
            },
            Granularity='MONTHLY',  # Use monthly for service breakdown
            Metrics=['BlendedCost'],
            GroupBy=[
                {
                    'Type': 'DIMENSION',
                    'Key': 'SERVICE'
                }
            ]
        )
        
        results = response.get('ResultsByTime', [])
        if results and results[0].get('Groups'):
            groups = results[0]['Groups']
            print(f"✓ Found costs for {len(groups)} services:")
            
            # Sort by cost (descending)
            service_costs = []
            for group in groups:
                service = group['Keys'][0] if group['Keys'] else 'Unknown'
                amount = float(group['Metrics']['BlendedCost']['Amount'])
                service_costs.append((service, amount))
            
            service_costs.sort(key=lambda x: x[1], reverse=True)
            
            for service, cost in service_costs[:10]:  # Top 10 services
                print(f"   {service}: ${cost:.2f}")
                
        else:
            print("⚠️  No service breakdown data available")
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to get service breakdown: {e}")
        return False

def main():
    """Main function to test AWS billing API"""
    print("🚀 AWS Billing API Test Script")
    print("=" * 50)
    
    # Load environment variables
    config = load_environment()
    
    # Create Cost Explorer client
    client = create_cost_explorer_client(config)
    if not client:
        sys.exit(1)
    
    # Test credentials
    if not test_credentials(client):
        print("\n💡 Troubleshooting tips:")
        print("   1. Check your AWS credentials in backend/.env")
        print("   2. Ensure your AWS user has CostExplorerServiceAccess permission")
        print("   3. Verify your credentials haven't expired")
        print("   4. Make sure you're using the correct AWS region")
        sys.exit(1)
    
    # Get cost data
    success = True
    success &= get_cost_data(client, days=30)
    success &= get_cost_by_service(client, days=30)
    
    if success:
        print("\n✅ All tests passed! Your AWS billing API is working correctly.")
        print("   The issue with your dashboard is likely in the frontend or API routing.")
    else:
        print("\n❌ Some tests failed. Check the errors above for troubleshooting.")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())