from django.core.management.base import BaseCommand
from payments.models import SubscriptionPlan
from payments.subscription_plans import SUBSCRIPTION_PLANS
import stripe
from django.conf import settings


class Command(BaseCommand):
    help = 'Create subscription plans from fixed configuration'

    def add_arguments(self, parser):
        parser.add_argument(
            '--create-stripe-products',
            action='store_true',
            help='Create products and prices in Stripe',
        )
        parser.add_argument(
            '--update-prices',
            action='store_true',
            help='Update existing plan prices',
        )

    def handle(self, *args, **options):
        # Set Stripe API key if creating Stripe products
        if options['create_stripe_products']:
            stripe.api_key = settings.STRIPE_SECRET_KEY
            self.stdout.write('Creating Stripe products and prices...')

        created_count = 0
        updated_count = 0

        for plan_key, plan_config in SUBSCRIPTION_PLANS.items():
            try:
                # Check if plan already exists
                existing_plan = SubscriptionPlan.objects.filter(
                    plan_type=plan_config['plan_type'],
                    tier=plan_config['tier']
                ).first()

                if existing_plan:
                    # Update existing plan
                    if options['update_prices']:
                        existing_plan.price = plan_config['price']
                        existing_plan.name = plan_config['name']
                        existing_plan.description = plan_config['description']
                        existing_plan.features = plan_config['features']
                        existing_plan.save()
                        updated_count += 1
                        self.stdout.write(f'Updated plan: {plan_config["name"]}')
                    else:
                        self.stdout.write(f'Plan {plan_config["name"]} already exists, skipping...')
                    continue

                # Create Stripe product and price if requested
                stripe_product_id = f'temp_product_{plan_key}'
                stripe_price_id = f'temp_price_{plan_key}'

                if options['create_stripe_products']:
                    try:
                        # Create Stripe product
                        stripe_product = stripe.Product.create(
                            name=plan_config['name'],
                            description=plan_config['description'],
                            metadata={
                                'plan_type': plan_config['plan_type'],
                                'tier': plan_config['tier'],
                                'plan_key': plan_key
                            }
                        )
                        stripe_product_id = stripe_product.id

                        # Create Stripe price
                        stripe_price = stripe.Price.create(
                            product=stripe_product_id,
                            unit_amount=int(plan_config['price'] * 100),  # Convert to cents
                            currency='usd',
                            recurring={'interval': 'month'},
                            metadata={
                                'plan_key': plan_key
                            }
                        )
                        stripe_price_id = stripe_price.id

                        self.stdout.write(f'Created Stripe product: {stripe_product_id}')
                        self.stdout.write(f'Created Stripe price: {stripe_price_id}')

                    except Exception as e:
                        self.stdout.write(f'Stripe error for {plan_config["name"]}: {str(e)}')
                        # Continue with temporary IDs

                # Create local plan
                plan = SubscriptionPlan.objects.create(
                    name=plan_config['name'],
                    plan_type=plan_config['plan_type'],
                    tier=plan_config['tier'],
                    price=plan_config['price'],
                    description=plan_config['description'],
                    features=plan_config['features'],
                    stripe_product_id=stripe_product_id,
                    stripe_price_id=stripe_price_id,
                    is_active=True
                )

                created_count += 1
                self.stdout.write(f'Created plan: {plan_config["name"]} (${plan_config["price"]}/month)')

            except Exception as e:
                self.stdout.write(f'Error creating plan {plan_config["name"]}: {str(e)}')

        self.stdout.write(f'\nFinished! Created {created_count} plans, updated {updated_count} plans.')
        
        if not options['create_stripe_products']:
            self.stdout.write('\nNote: Stripe products were not created. Run with --create-stripe-products to create them.')
        
        # Display plan summary
        self.stdout.write('\n=== SUBSCRIPTION PLANS SUMMARY ===')
        for plan_key, plan_config in SUBSCRIPTION_PLANS.items():
            self.stdout.write(f'\n🔹 {plan_config["name"]}')
            self.stdout.write(f'   Price: ${plan_config["price"]}/month')
            self.stdout.write(f'   Project Fee: {plan_config["project_fee_rate"]}%')
            self.stdout.write(f'   Features: {len(plan_config["features"])} features')
            
        self.stdout.write('\n=== FEATURE BREAKDOWN ===')
        all_features = set()
        for plan_config in SUBSCRIPTION_PLANS.values():
            all_features.update(plan_config['features'])
        
        self.stdout.write(f'Total unique features: {len(all_features)}')
        for feature in sorted(all_features):
            self.stdout.write(f'  • {feature}') 