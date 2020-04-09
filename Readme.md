# Programmer via GraphQL Federation POC (Option 2)

This repository is a POC demo of using GraphQL Federation for Programmer.

For context, [please see this doc](https://docs.google.com/document/d/1o2l25XPB6S89oBzpDCvYo1FwLIlaMul2ErGQ1soRlhE).

### Installation

To run this demo locally, pull down the repository then run the following commands:

```sh
npm install
npm start
```

This will start up the dependent services and make the Gateway available at http://localhost:4000

#### Sample Query

```graphql
query O2PersonalizedFeed {
  user(id: "hi") {
    email
    PersonalizedFeed(uri: "nyt://feed/1") {
      uri
      name
      expressions {
        uri
        packages {
          uri
          layout
          articles {
            uri
            headline {
              default
            }
          }
        }
      }
    }
    # subscriptionStatus
    ABRA(integration: "integration1") {
      ABRAVariants {
        name
        variant
        data
      }
    }
  }
}
```