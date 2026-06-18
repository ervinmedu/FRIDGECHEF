import Stripe from "stripe";

const PRODUCT = "prod_UjHIijirQxHXWd";

const PRICES = [
  { key:"DEFAULT",  currency:"usd", monthly:499,    yearly:3999    },
  { key:"EUR",      currency:"eur", monthly:449,    yearly:3599    },
  { key:"GBP",      currency:"gbp", monthly:399,    yearly:3199    },
  { key:"CAD",      currency:"cad", monthly:699,    yearly:5599    },
  { key:"AUD",      currency:"aud", monthly:749,    yearly:5999    },
  { key:"NZD",      currency:"nzd", monthly:799,    yearly:6499    },
  { key:"INR",      currency:"inr", monthly:39900,  yearly:319900  },
  { key:"BRL",      currency:"brl", monthly:2790,   yearly:21900   },
  { key:"MXN",      currency:"mxn", monthly:9900,   yearly:77900   },
  { key:"PHP",      currency:"php", monthly:27900,  yearly:219900  },
  { key:"SGD",      currency:"sgd", monthly:649,    yearly:5199    },
  { key:"MYR",      currency:"myr", monthly:2390,   yearly:18900   },
  { key:"IDR",      currency:"idr", monthly:8290000,yearly:65900000},
  { key:"THB",      currency:"thb", monthly:17900,  yearly:141900  },
  { key:"JPY",      currency:"jpy", monthly:750,    yearly:5999    },
  { key:"KRW",      currency:"krw", monthly:7200,   yearly:54900   },
  { key:"HKD",      currency:"hkd", monthly:3899,   yearly:31199   },
  { key:"AED",      currency:"aed", monthly:1899,   yearly:14499   },
  { key:"ZAR",      currency:"zar", monthly:9300,   yearly:74900   },
  { key:"NGN",      currency:"ngn", monthly:820000, yearly:6590000 },
  { key:"CHF",      currency:"chf", monthly:449,    yearly:3599    },
  { key:"NOK",      currency:"nok", monthly:5499,   yearly:44499   },
  { key:"SEK",      currency:"sek", monthly:5499,   yearly:44499   },
  { key:"DKK",      currency:"dkk", monthly:3499,   yearly:27999   },
  { key:"TWD",      currency:"twd", monthly:15500,  yearly:124900  },
];

export async function GET(req) {
  const sk = new URL(req.url).searchParams.get("sk");
  if (!sk || !sk.startsWith("sk_live_")) {
    return Response.json({ error: "Missing or invalid sk param" }, { status: 400 });
  }

  const stripe = new Stripe(sk);
  const results = {};

  for (const p of PRICES) {
    const [monthly, yearly] = await Promise.all([
      stripe.prices.create({
        product: PRODUCT,
        currency: p.currency,
        unit_amount: p.monthly,
        recurring: { interval: "month" },
        nickname: `${p.key} Monthly 4.99`,
      }),
      stripe.prices.create({
        product: PRODUCT,
        currency: p.currency,
        unit_amount: p.yearly,
        recurring: { interval: "year" },
        nickname: `${p.key} Yearly 39.99`,
      }),
    ]);
    results[p.key] = { monthlyId: monthly.id, yearlyId: yearly.id };
  }

  return Response.json(results);
}
