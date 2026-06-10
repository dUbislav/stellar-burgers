# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: constructor.pl.tsx >> Burger constructor >> adds bun and main ingredient to constructor
- Location: tests\constructor.pl.tsx:80:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByTestId('add-ingredient-button-643d69a5c3f7b9001cfa093c').locator('button')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - navigation [ref=e5]:
      - generic [ref=e6]:
        - link "Конструктор" [ref=e7] [cursor=pointer]:
          - /url: /
          - img [ref=e8]
          - paragraph [ref=e10]: Конструктор
        - link "Лента заказов" [ref=e11] [cursor=pointer]:
          - /url: /feed
          - img [ref=e12]
          - paragraph [ref=e14]: Лента заказов
      - img [ref=e16]
      - link "Личный кабинет" [ref=e84] [cursor=pointer]:
        - /url: /profile
        - img [ref=e85]
        - paragraph [ref=e87]: Личный кабинет
  - generic [ref=e88]: Failed to fetch
```

# Test source

```ts
  1   | import { test, expect, Page } from '@playwright/test';
  2   | import { readFileSync } from 'fs';
  3   | 
  4   | type TIngredient = {
  5   |   _id: string;
  6   |   name: string;
  7   |   type: 'bun' | 'main' | 'sauce';
  8   | };
  9   | 
  10  | const ingredientsMock = JSON.parse(
  11  |   readFileSync('mocks/d865ae765d0bd24d2055469500cc7f17b1056715.json', 'utf-8')
  12  | ) as { data: TIngredient[] };
  13  | 
  14  | const bun = ingredientsMock.data.find(
  15  |   (ingredient) => ingredient.type === 'bun'
  16  | );
  17  | const main = ingredientsMock.data.find(
  18  |   (ingredient) => ingredient.type === 'main'
  19  | );
  20  | 
  21  | if (!bun || !main) {
  22  |   throw new Error(
  23  |     'Ingredients mock must contain at least one bun and one main'
  24  |   );
  25  | }
  26  | 
  27  | const orderNumber = 12345;
  28  | 
  29  | const mockCommonRequests = async (page: Page) => {
  30  |   await page.routeFromHAR('./tests/hars/ingredients.har', {
  31  |     url: '**/api/ingredients',
  32  |     update: false
  33  |   });
  34  | 
  35  |   await page.route('**/api/orders/all', async (route) => {
  36  |     await route.fulfill({
  37  |       status: 200,
  38  |       contentType: 'application/json',
  39  |       body: JSON.stringify({
  40  |         success: true,
  41  |         orders: [],
  42  |         total: 0,
  43  |         totalToday: 0
  44  |       })
  45  |     });
  46  |   });
  47  | };
  48  | 
  49  | const mockAuthorizedUser = async (page: Page) => {
  50  |   await page.route('**/api/auth/user', async (route) => {
  51  |     await route.fulfill({
  52  |       status: 200,
  53  |       contentType: 'application/json',
  54  |       body: JSON.stringify({
  55  |         success: true,
  56  |         user: {
  57  |           email: 'test@test.ru',
  58  |           name: 'Test User'
  59  |         }
  60  |       })
  61  |     });
  62  |   });
  63  | };
  64  | 
  65  | test.describe('Burger constructor', () => {
  66  |   test.beforeEach(async ({ page }) => {
  67  |     await mockCommonRequests(page);
  68  |     await page.route('**/api/auth/user', async (route) => {
  69  |       await route.fulfill({
  70  |         status: 401,
  71  |         contentType: 'application/json',
  72  |         body: JSON.stringify({
  73  |           success: false,
  74  |           message: 'You should be authorised'
  75  |         })
  76  |       });
  77  |     });
  78  |   });
  79  | 
  80  |   test('adds bun and main ingredient to constructor', async ({ page }) => {
  81  |     await page.goto('/');
  82  | 
  83  |     await page
  84  |       .getByTestId(`add-ingredient-button-${bun._id}`)
  85  |       .locator('button')
> 86  |       .click();
      |        ^ Error: locator.click: Test timeout of 30000ms exceeded.
  87  | 
  88  |     await expect(page.getByTestId('constructor-bun-top')).toContainText(
  89  |       bun.name
  90  |     );
  91  |     await expect(page.getByTestId('constructor-bun-bottom')).toContainText(
  92  |       bun.name
  93  |     );
  94  | 
  95  |     await page
  96  |       .getByTestId(`add-ingredient-button-${main._id}`)
  97  |       .locator('button')
  98  |       .click();
  99  | 
  100 |     await expect(
  101 |       page.getByTestId(`constructor-ingredient-${main._id}`)
  102 |     ).toContainText(main.name);
  103 |   });
  104 | 
  105 |   test('opens ingredient modal', async ({ page }) => {
  106 |     await page.goto('/');
  107 | 
  108 |     await page.getByTestId(`ingredient-link-${bun._id}`).click();
  109 | 
  110 |     await expect(page.getByTestId('modal')).toBeVisible();
  111 |     await expect(page.getByTestId('modal')).toContainText(bun.name);
  112 |   });
  113 | 
  114 |   test('closes ingredient modal by close button', async ({ page }) => {
  115 |     await page.goto('/');
  116 | 
  117 |     await page.getByTestId(`ingredient-link-${bun._id}`).click();
  118 |     await expect(page.getByTestId('modal')).toBeVisible();
  119 | 
  120 |     await page.getByTestId('modal-close').click();
  121 | 
  122 |     await expect(page.getByTestId('modal')).not.toBeVisible();
  123 |   });
  124 | 
  125 |   test('closes ingredient modal by overlay click', async ({ page }) => {
  126 |     await page.goto('/');
  127 | 
  128 |     await page.getByTestId(`ingredient-link-${bun._id}`).click();
  129 |     await expect(page.getByTestId('modal')).toBeVisible();
  130 | 
  131 |     await page
  132 |       .getByTestId('modal-overlay')
  133 |       .click({ position: { x: 10, y: 10 } });
  134 | 
  135 |     await expect(page.getByTestId('modal')).not.toBeVisible();
  136 |   });
  137 | 
  138 |   test('creates order, shows order number and clears constructor', async ({
  139 |     page,
  140 |     context
  141 |   }) => {
  142 |     await context.addCookies([
  143 |       {
  144 |         name: 'accessToken',
  145 |         value: 'Bearer test-access-token',
  146 |         url: 'http://localhost:4000'
  147 |       }
  148 |     ]);
  149 | 
  150 |     await page.addInitScript(() => {
  151 |       window.localStorage.setItem('refreshToken', 'test-refresh-token');
  152 |     });
  153 | 
  154 |     await mockAuthorizedUser(page);
  155 | 
  156 |     await page.route('**/api/orders', async (route) => {
  157 |       if (route.request().method() !== 'POST') {
  158 |         await route.fallback();
  159 |         return;
  160 |       }
  161 | 
  162 |       await route.fulfill({
  163 |         status: 200,
  164 |         contentType: 'application/json',
  165 |         body: JSON.stringify({
  166 |           success: true,
  167 |           name: 'Test order',
  168 |           order: {
  169 |             _id: 'test-order-id',
  170 |             status: 'done',
  171 |             name: 'Test order',
  172 |             number: orderNumber,
  173 |             price: 1000,
  174 |             owner: {
  175 |               name: 'Test User',
  176 |               email: 'test@test.ru',
  177 |               createdAt: '2026-01-01T00:00:00.000Z',
  178 |               updatedAt: '2026-01-01T00:00:00.000Z'
  179 |             },
  180 |             createdAt: '2026-01-01T00:00:00.000Z',
  181 |             updatedAt: '2026-01-01T00:00:00.000Z'
  182 |           }
  183 |         })
  184 |       });
  185 |     });
  186 | 
```