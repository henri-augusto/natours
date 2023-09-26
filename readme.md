# Natours Application

[[![EXPRESS Version]][npm-expreess-version]]

Built using modern technologies: node.js, express, mongoDB and mongoose.

## Preview

You can see live this project on https://natours-henri-015b3f3cb754.herokuapp.com/

## Comments

Still work in this project, but you already can sign up and with a real world email and received a wolcome email.
You can also buy a booking setting a real world credit card. But if you don't want use your credit card, you can use this credit card test

### Test Credit Card

´´
number: 4242 4242 4242 4242; date: 02/32; cvc: 222
´´

## Challenges

In this project, a lot of features was a challenge, but here that i consider a "real challenge":

### nº 1

```js
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'script-src': [
          "'self'",
          'api.mapbox.com',
          'cdnjs.cloudflare.com',
          "'unsafe-eval'",
        ],
        'worker-src': ['blob: '],
        'connect-src': [
          "'self'",
          'api.mapbox.com',
          'tiles.mapbox.com',
          'events.mapbox.com',
        ],
      },
    },
  }),
);
```

This feature, i got a lot of work to solved. To fix the CSP on my project,
i used HELMET for handled this and pass the directives to authorized the scripts.

[npm-expreess-version]: https://badgen.net/npm/v/express
