import React from 'react';
import Stripe from 'stripe';

import { upsertUserSubscription } from '@/features/account/controllers/upsert-user-subscription';
import PaymentSuccess from '@/features/emails/paymentsuccess';
import { upsertPrice } from '@/features/pricing/controllers/upsert-price';
import { upsertProduct } from '@/features/pricing/controllers/upsert-product';
import { resendClient } from '@/libs/resend/resend-client';
import { stripeAdmin } from '@/libs/stripe/stripe-admin';
import { getEnvVar } from '@/utils/get-env-var';

const relevantEvents = new Set([
  'product.created',
  'product.updated',
  'price.created',
  'price.updated',
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;
  const webhookSecret = getEnvVar(process.env.STRIPE_WEBHOOK_SECRET, 'STRIPE_WEBHOOK_SECRET');
  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret) return;
    event = stripeAdmin.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (error) {
    return Response.json(`Webhook Error: ${(error as any).message}`, { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case 'product.created':
        case 'product.updated':
          await upsertProduct(event.data.object as Stripe.Product);
          break;
        case 'price.created':
        case 'price.updated':
          await upsertPrice(event.data.object as Stripe.Price);
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const subscription = event.data.object as Stripe.Subscription;
          await upsertUserSubscription({
            subscriptionId: subscription.id,
            customerId: subscription.customer as string,
            isCreateAction: false,
          });
          break;
        case 'checkout.session.completed':
          const checkoutSession = event.data.object as Stripe.Checkout.Session;

          if (checkoutSession.mode === 'subscription') {
            const subscriptionId = checkoutSession.subscription;
            await upsertUserSubscription({
              subscriptionId: subscriptionId as string,
              customerId: checkoutSession.customer as string,
              isCreateAction: true,
            });
            const userEmail = checkoutSession.customer_details?.email;
            if (!userEmail) {
              console.error('User email is missing in the checkout session.');
              return Response.json('User email is missing in the checkout session.', { status: 400 });
            }
            console.log('subscription success, useremail:', userEmail);

            try {
              const emailResponse = await resendClient.emails.send({
                from: 'team@paperai.life',
                to: userEmail,
                subject: 'Welcome!',
                react: React.createElement(PaymentSuccess),
              });
              console.log('Email sent successfully:', emailResponse);
            } catch (emailError) {
              console.error('Failed to send email:', emailError);
              return Response.json('Failed to send email.', { status: 500 });
            }
          } else if (checkoutSession.mode === 'payment') {
            // 处理一次性购买逻辑
            const paymentIntentId = checkoutSession.payment_intent;
            const userEmail = checkoutSession.customer_details?.email;
            if (!userEmail) {
              console.error('User email is missing in the checkout session.');
              return Response.json('User email is missing in the checkout session.', { status: 400 });
            }
            console.log('useremail:', userEmail)
            // 更新订单状态或其他相关逻辑
            console.log('Payment succeeded! PaymentIntent ID:', paymentIntentId);

            try {
              const emailResponse = await resendClient.emails.send({
                from: 'team@paperai.life',
                to: userEmail,
                subject: 'Thank you for your purchase!',
                react: React.createElement(PaymentSuccess),
              });
              console.log('Email sent successfully:', emailResponse);
            } catch (emailError) {
              console.error('Failed to send email:', emailError);
              return Response.json('Failed to send email.', { status: 500 });
            }
          }
          break;
        default:
          throw new Error('Unhandled relevant event!');
      }
    } catch (error) {
      console.error(error);
      return Response.json('Webhook handler failed. View your nextjs function logs.', {
        status: 400,
      });
    }
  }
  return Response.json({ received: true });
}
