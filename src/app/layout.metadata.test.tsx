import { Metadata } from 'next';
import { metadata } from './layout';

describe('RootLayout metadata', () => {
  it('has correct metadata', () => {
    expect(metadata.title).toBe('Bidding System');
    expect(metadata.description).toBe(
      'A simple bidding system built with Next.js, Shadcn/UI, and Prisma'
    );
  });
});
