import { Body, Button, Container, Head, Heading, Html, Link, Preview, Section, Text } from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';

import tailwindConfig from './tailwind.config';

const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

export function PaymentSuccess() {
  // 生成一个从 1 到 5 的随机整数
  const randomImageNumber = Math.floor(Math.random() * 5) + 1;
  const imageUrl = `https://file.paperai.life/secret%2F${randomImageNumber}.jpg`;

  return (
    <Html>
      <Head />
      <Preview>Yes!</Preview>
      <Tailwind config={tailwindConfig}>
        <Body className='mx-auto my-auto bg-slate-500 px-2 py-10 font-sans'>
          <Container className='mx-auto mt-[40px] w-[464px] overflow-hidden rounded-md bg-white'>
            <Section className={`h-[255px] w-full bg-black bg-[url('${baseUrl + '/hero-shape.png'}')] bg-center`}>
              <Heading className='mb-0 mt-[70px] text-center text-[48px] font-bold text-white'>Welcome!</Heading>
            </Section>
            <Section className='p-8'>
              <Heading as='h2' className='m-0 text-[24px] font-bold'>
                Thanks for buying.
              </Heading>
              <Text className='my-6 text-[16px]'>Here is your pictures.</Text>
              <Link className='text-center text-xs text-black underline' href={imageUrl}>
                enjoy(click me)
              </Link>
              <Button href={baseUrl + '/dashboard'} className='rounded-md bg-black px-4 py-2 font-medium text-white'>
                Dashboard
              </Button>
            </Section>
          </Container>
          <Container className='mx-auto mt-4'>
            <Section className='text-center'>
              <Text className='m-0 text-xs text-white'>Not interested in receiving this email?</Text>
              <Link className='text-center text-xs text-white underline' href={baseUrl + '/account'}>
                Turn off this notification in your account settings.
              </Link>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default PaymentSuccess;
