# Vue2 Composition Router

Some router helpers for vue2 with composition api.

## Install

```bash
npm install vue2-composition-router
# or
yarn add vue2-composition-router
```

## Usage

### useRouter / useRoute

```ts
import { useRouter, useRoute } from 'vue2-composition-router'

export default {
  setup() {
    // router instance, equivalent to `this.$router`
    const router = useRouter()

    // current route, equivalent to `this.$route`
    const route = useRoute()
  }
}
```

### useRouteQueries / useRouteQuery

Example path: `/?foo=left&bar=1`

```ts
import { useRouteQueries, useRouteQuery } from 'vue2-composition-router'

export default {
  setup() {
    // get
    const queries = useRouteQueries()  // { foo: 'left', bar: '1' }
    const foo = useRouteQuery('foo')   // 'left'

    // set
    queries.value = { bar: '2' }       // /?bar=2
    foo.value = 'right'                // /?bar=2&foo=right
  }
}
```

### useRouteParams / useRouteParam

Example route config:
```js
{
    path: '/example/:foo/:bar?',
    ...
}
```

Example path: `/example/left/1`

```ts
import { useRouteParams, useRouteParam } from 'vue2-composition-router'

export default {
  setup() {
    // get
    const params = useRouteParams()           // { foo: 'left', bar: '1' }
    const foo = useRouteParam('foo')          // 'left'

    // set
    params.value = { foo: 'right', bar: '2' } // /example/right/2
    foo.value = 'center'                      // /example/center
  }
}
```

`useRouteParams` will parse current route config path and pick up dynamic route params automatically.

## useRouteParamOrQuery

Same as `useRouteParam` and `useRouteQuery`, but the difference is that it automatically bind param or query based on whether the route param includes the key name.

```ts
import { useRouteParamOrQuery } from 'vue2-composition-router'

export default {
  setup() {
    // if 'foo' is exist in param, it binds param, or else it binds query.
    const foo = useRouteParamOrQuery('foo') 
  }
}
```
