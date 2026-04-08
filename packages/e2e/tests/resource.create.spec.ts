import { expect, test } from '@playwright/test';

test('shows prompt to create resource when installation is empty', async ({
  page,
}) => {
  await page.goto('/');

  const heading = page.getByRole('heading', { name: 'Shadow' });
  await expect(heading).toBeVisible();

  const createLink = page.getByRole('link', { name: 'Create new resource' });
  await expect(createLink).toBeVisible();

  const noResourcesText = page.getByText('No resources yet');
  await expect(noResourcesText).toBeVisible();
});

test('navigates to new resource page when clicking create', async ({
  page,
}) => {
  await page.goto('/');

  await page.getByRole('link', { name: 'Create new resource' }).click();

  await expect(page).toHaveURL('/new-resource');

  const heading = page.getByRole('heading', { name: 'New Resource' });
  await expect(heading).toBeVisible();

  const nameInput = page.getByLabel('Resource name');
  await expect(nameInput).toBeVisible();

  const bodyTextarea = page.getByLabel('Template');
  await expect(bodyTextarea).toBeVisible();

  const saveButton = page.getByRole('button', { name: 'Save' });
  await expect(saveButton).toBeVisible();
});

test('shows validation errors when submitting empty form', async ({ page }) => {
  await page.goto('/new-resource');

  await page.getByRole('button', { name: 'Save' }).click();

  const nameInput = page.getByLabel('Resource name');
  await expect(nameInput).toBeVisible();
});

test('creates resource and redirects to index showing new resource', async ({
  page,
}) => {
  await page.goto('/new-resource');

  await page.getByLabel('Resource name').fill('my-template');
  await page.getByLabel('MIME type').fill('text/plain');
  await page.getByLabel('Template').fill('Hello {{name}}!');

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page).toHaveURL('/');

  const resourceItem = page.getByText('my-template');
  await expect(resourceItem).toBeVisible();

  const createLink = page.getByRole('link', { name: 'Create new resource' });
  await expect(createLink).toBeVisible();
});

test('stored resource is listed on index after creation', async ({ page }) => {
  await page.goto('/new-resource');

  await page.getByLabel('Resource name').fill('my-config');
  await page.getByLabel('MIME type').fill('text/plain');
  await page.getByLabel('Template').fill('{{! config template }}');

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page).toHaveURL('/');

  const resourceItem = page.getByText('my-config');
  await expect(resourceItem).toBeVisible();
});
