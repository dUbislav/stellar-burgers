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

const bun = ingredientsMock.data.find((i) => i.type === 'bun');
const main = ingredientsMock.data.find((i) => i.type === 'main');

if (!bun || !main) {
  throw new Error(
    'Ingredients mock must contain at least one bun and one main'
  );
}

const orderNumber = 12345;

test.describe('Burger constructor', () => {
  test.beforeEach(async ({ page }) => {
    await page.routeFromHAR('./tests/hars/ingredients.har', {
      url: '**/api/ingredients',
      update: false
    });

    await page.routeFromHAR('./tests/hars/orders-all-empty.har', {
      url: '**/api/orders/all',
      update: false
    });

    await page.routeFromHAR('./tests/hars/auth-401.har', {
      url: '**/api/auth/user',
      update: false
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
  });

  test('closes ingredient modal by close button', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId(`ingredient-link-${bun._id}`).click();
    await page.getByTestId('modal-close').click();
    await expect(page.getByTestId('modal')).not.toBeVisible();
  });

  test('closes ingredient modal by overlay click', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId(`ingredient-link-${bun._id}`).click();
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

    await page.routeFromHAR('./tests/hars/auth-200.har', {
      url: '**/api/auth/user',
      update: false
    });

    await page.routeFromHAR('./tests/hars/order-post-success.har', {
      url: '**/api/orders',
      update: false
    });

    await page.goto('/');

    // Действия в конструкторе
    await page
      .getByTestId(`add-ingredient-button-${bun._id}`)
      .locator('button')
      .click();
    await page
      .getByTestId(`add-ingredient-button-${main._id}`)
      .locator('button')
      .click();

    await page.getByTestId('order-button').locator('button').click();

    // Проверки модалки заказа
    await expect(page.getByTestId('modal')).toBeVisible();
    await expect(page.getByTestId('order-number')).toHaveText(
      String(orderNumber)
    );

    await expect(page.getByTestId('no-buns-top')).toBeVisible();
    await expect(page.getByTestId('no-ingredients')).toBeVisible();

    await page.getByTestId('modal-close').click();
    await expect(page.getByTestId('modal')).not.toBeVisible();
  });
});
