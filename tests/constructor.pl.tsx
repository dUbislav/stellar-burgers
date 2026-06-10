import { test, expect, Page } from '@playwright/test';
import { readFileSync } from 'fs';

type TIngredient = {
  _id: string;
  name: string;
  type: 'bun' | 'main' | 'sauce';
};

const ingredientsMock = JSON.parse(
  readFileSync(
    './tests/hars/d865ae765d0bd24d2055469500cc7f17b1056715.json',
    'utf-8'
  )
) as { data: TIngredient[] };

const bun = ingredientsMock.data.find(
  (ingredient) => ingredient.type === 'bun'
);
const main = ingredientsMock.data.find(
  (ingredient) => ingredient.type === 'main'
);

if (!bun || !main) {
  throw new Error(
    'Ingredients mock must contain at least one bun and one main'
  );
}

const orderNumber = 12345;

const mockCommonRequests = async (page: Page) => {
  await page.routeFromHAR('./tests/hars/ingredients.har', {
    url: '**/api/ingredients',
    update: false
  });

  await page.route('**/api/orders/all', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        orders: [],
        total: 0,
        totalToday: 0
      })
    });
  });
};

const mockAuthorizedUser = async (page: Page) => {
  await page.route('**/api/auth/user', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        user: {
          email: 'test@test.ru',
          name: 'Test User'
        }
      })
    });
  });
};

test.describe('Burger constructor', () => {
  test.beforeEach(async ({ page }) => {
    await mockCommonRequests(page);
    await page.route('**/api/auth/user', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'You should be authorised'
        })
      });
    });
  });

  test('adds bun and main ingredient to constructor', async ({ page }) => {
    await page.goto('/');

    await page
      .getByTestId(`add-ingredient-button-${bun._id}`)
      .locator('button')
      .click();

    await expect(page.getByTestId('constructor-bun-top')).toContainText(
      bun.name
    );
    await expect(page.getByTestId('constructor-bun-bottom')).toContainText(
      bun.name
    );

    await page
      .getByTestId(`add-ingredient-button-${main._id}`)
      .locator('button')
      .click();

    await expect(
      page.getByTestId(`constructor-ingredient-${main._id}`)
    ).toContainText(main.name);
  });

  test('opens ingredient modal', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId(`ingredient-link-${bun._id}`).click();

    await expect(page.getByTestId('modal')).toBeVisible();
    await expect(page.getByTestId('modal')).toContainText(bun.name);
  });

  test('closes ingredient modal by close button', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId(`ingredient-link-${bun._id}`).click();
    await expect(page.getByTestId('modal')).toBeVisible();

    await page.getByTestId('modal-close').click();

    await expect(page.getByTestId('modal')).not.toBeVisible();
  });

  test('closes ingredient modal by overlay click', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId(`ingredient-link-${bun._id}`).click();
    await expect(page.getByTestId('modal')).toBeVisible();

    await page
      .getByTestId('modal-overlay')
      .click({ position: { x: 10, y: 10 } });

    await expect(page.getByTestId('modal')).not.toBeVisible();
  });

  test('creates order, shows order number and clears constructor', async ({
    page,
    context
  }) => {
    await context.addCookies([
      {
        name: 'accessToken',
        value: 'Bearer test-access-token',
        url: 'http://localhost:4000'
      }
    ]);

    await page.addInitScript(() => {
      window.localStorage.setItem('refreshToken', 'test-refresh-token');
    });

    await mockAuthorizedUser(page);

    await page.route('**/api/orders', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.fallback();
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          name: 'Test order',
          order: {
            _id: 'test-order-id',
            status: 'done',
            name: 'Test order',
            number: orderNumber,
            price: 1000,
            owner: {
              name: 'Test User',
              email: 'test@test.ru',
              createdAt: '2026-01-01T00:00:00.000Z',
              updatedAt: '2026-01-01T00:00:00.000Z'
            },
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z'
          }
        })
      });
    });

    await page.goto('/');

    await page
      .getByTestId(`add-ingredient-button-${bun._id}`)
      .locator('button')
      .click();
    await page
      .getByTestId(`add-ingredient-button-${main._id}`)
      .locator('button')
      .click();

    await expect(page.getByTestId('constructor-bun-top')).toBeVisible();
    await expect(
      page.getByTestId(`constructor-ingredient-${main._id}`)
    ).toBeVisible();

    await page.getByTestId('order-button').locator('button').click();

    await expect(page.getByTestId('modal')).toBeVisible();
    await expect(page.getByTestId('order-number')).toHaveText(
      String(orderNumber)
    );

    await expect(page.getByTestId('no-buns-top')).toBeVisible();
    await expect(page.getByTestId('no-ingredients')).toBeVisible();
    await expect(
      page.getByTestId(`constructor-ingredient-${main._id}`)
    ).not.toBeVisible();

    await page.getByTestId('modal-close').click();

    await expect(page.getByTestId('modal')).not.toBeVisible();
  });
});
