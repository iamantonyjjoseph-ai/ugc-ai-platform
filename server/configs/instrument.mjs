import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://18a7b6b4947c03c38164259b8431aba1@o4511847044874240.ingest.de.sentry.io/4511847156744273",
  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/node/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: [],
  },
});
