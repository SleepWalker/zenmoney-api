A nodejs implementation of zenmoney api:
https://github.com/zenmoney/ZenPlugins/wiki/ZenMoney-API

## Установка

```bash
npm install zenmoney-api
```

или

```bash
yarn add zenmoney-api
```

## Пример использования

```js
import { zenmoneyApi } from 'zenmoney-api';

const username = '...';
const password = '...';
const apiKey = '...';
const apiSecret = '...';

const token = '...';

(async () => {
  try {
    // Авторизация по логину, паролю и ключу приложения
    await zenmoneyApi.authorize({
      username,
      password,
      apiKey,
      apiSecret,
    });

    // Авторизация по токену
    await zenmoneyApi.authorizeByToken(token);

    const diff = await zenmoneyApi.diff({
      // fetch prev two months
      serverTimestamp: Math.round(
        (Date.now() - 60 * 24 * 60 * 60 * 1000) / 1000,
      ),
    });

    // strip arrays to only 3 items
    Object.values(diff).forEach((item) => {
      if (Array.isArray(item)) {
        item.splice(0, item.length - 3);
      }
    });

    console.dir(diff, { depth: null });

    const suggestion = await zenmoneyApi.suggest({
      payee: 'McDonalds',
    });

    console.log('Suggestion for McDonalds');
    console.dir(suggestion, { depth: null });
  } catch (error) {
    console.log('Error requesting diff', {
      error,
      request: error.request,
      response: error.response,
    });

    process.exit(1);
  }

  process.exit(0);
})();
```

## TODO

- возможность авторизации через oauth
- проверка времени жизни токена, автоматическое обновление токена
- обработка ошибок api
