/**
 * Stub data.
 * 
 * Of course in practice these would all be resolved
 * async, but that assumption is implied (resolvers can
 * return promises). So to keep things straightforward
 * in this demo, it's all resolved synchronously.
 */

const USER_DATA = [
  {
    id: "subscriber-user1",
    email: "subscriber@example.com",
    subscriptionStatus: "SUBSCRIBER"
  },
  {
    id: "anon-user2",
    email: "anon@example.com",
    subscriptionStatus: "ANON"
  }
];

const ARTICLE_DATA = [
  {
    uri: "nyt://article/" + Math.floor(Math.random() * 1000),
    headline: {
      subHeadline: "subHead",
      seo: "seo head",
      default: "default head"
    }
  },
  {
    uri: "nyt://article/" + Math.floor(Math.random() * 1000),
    headline: {
      subHeadline: "subHead",
      seo: "seo head",
      default: "default head"
    }
  },
  {
    uri: "nyt://article/" + Math.floor(Math.random() * 1000),
    headline: {
      subHeadline: "subHead",
      seo: "seo head",
      default: "default head"
    }
  },
  {
    uri: "nyt://article/" + Math.floor(Math.random() * 1000),
    headline: {
      subHeadline: "subHead",
      seo: "seo head",
      default: "default head"
    }
  }
];

const FEEDEXPRESSIONS_DATA = [
  {
    // FeedExpressions
    uri: "nyt://feedExpressions/1",
    packages: [
      {
        // FeedPackages
        uri: "nyt://feedPackages/1",
        layout: "AGNOSTIC",
        articles: ARTICLE_DATA.slice(0, 2)
      },
      {
        // FeedPackages
        uri: "nyt://feedPackages/2",
        layout: "AGNOSTIC",
        articles: ARTICLE_DATA.slice(1, 3)
      }
    ]
  },
  {
    // FeedExpressions
    uri: "nyt://feedExpressions/2",
    packages: [
      {
        // FeedPackages
        uri: "nyt://feedPackages/3",
        layout: "CAROUSEL",
        articles: ARTICLE_DATA.slice(3)
      },
      {
        // FeedPackages
        uri: "nyt://feedPackages/4",
        layout: "CAROUSEL",
        articles: ARTICLE_DATA.slice(2)
      }
    ]
  }
]

const FEED_DATA = [
  // feeds
  {
    uri: "nyt://feed/1",
    name: "feed1",
    // expressions: [
    //   {
    //     // FeedExpressions
    //     uri: "nyt://feedExpressions/1",
    //     packages: [
    //       {
    //         // FeedPackages
    //         uri: "nyt://feedPackages/1",
    //         layout: "AGNOSTIC",
    //         articles: ARTICLE_DATA
    //       }
    //     ]
    //   }
    // ]
  },
  {
    uri: "nyt://feed/2",
    name: "feed2"
  }
];

const ABRA_DATA = [
  {
    name: "test1",
    variant: "variant1",
    data: "data1"
  },
  {
    name: "test2",
    variant: "variant2",
    data: "data2"
  },
];

module.exports = {
  USER_DATA,
  ARTICLE_DATA,
  FEED_DATA,
  FEEDEXPRESSIONS_DATA,
  ABRA_DATA
}