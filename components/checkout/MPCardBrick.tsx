'use client';

import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';
import { useEffect, useState } from 'react';

interface MPCardBrickProps {
  amount: number;
  onSubmit: (param: any) => Promise<void>;
  locale?: string;
}

export default function MPCardBrick({
  amount,
  onSubmit,
  locale = 'es',
}: MPCardBrickProps) {
  const [initialized, setInitialized] = useState(false);
  const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;

  useEffect(() => {
    if (publicKey) {
      // Use proper locale format for Mercado Pago SDK (es-CO or en-US)
      const mpLocale = locale === 'en' ? 'en-US' : 'es-CO';
      initMercadoPago(publicKey, { locale: mpLocale });
      setInitialized(true);
    }
  }, [publicKey, locale]);

  if (!publicKey) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-xl text-center text-red-600 font-nunito text-[14px]">
        Error: la variable <strong>NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY</strong> no está configurada.
      </div>
    );
  }

  if (!initialized) {
    return (
      <div className="flex justify-center items-center py-6">
        <div className="w-6 h-6 border-2 border-[#686A54] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full bg-white p-4 rounded-xl border border-[#E8E2DA] shadow-sm max-w-md mx-auto">
      <CardPayment
        initialization={{
          amount: amount,
        }}
        customization={{
          visual: {
            style: {
              theme: 'flat', // Sleek flat design matches Boho style
            },
          },
          paymentMethods: {
            maxInstallments: 1, // Only 1 installment for quick event checkout
          }
        }}
        onSubmit={async (param) => {
          // Send brick's form data payload to the parent handler
          await onSubmit(param);
        }}
        onError={(error) => {
          console.error('[MPCardBrick] Mercado Pago SDK Error:', error);
        }}
      />
    </div>
  );
}
