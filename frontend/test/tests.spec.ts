import { test, expect } from '@playwright/test';
 
test('Create user', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.fill('[name="create_user_form_name"]', 'Test User');
  await page.fill('[name="create_user_form_email"]', 'testuser@example.com');
  await page.fill('[name="create_user_form_username"]', 'testuser');
  await page.fill('[name="create_user_form_password"]', 'password123');
  await page.click('[name="create_user_form_create_user"]');
  
  const response = await page.waitForResponse(response => response.url().includes('/users') && response.status() === 201);
  expect(response.ok()).toBeTruthy();
});

// Login User Test
test('Login user', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.fill('[name="login_form_username"]', 'testuser');
  await page.fill('[name="login_form_password"]', 'password123');
  await page.click('[name="login_form_login"]');
  
  const response = await page.waitForResponse(response => response.url().includes('/login') && response.status() === 200);
  expect(response.ok()).toBeTruthy();
});

// Add Note Test (Logged In)
test('logged in user can add note', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.fill('[name="login_form_username"]', 'testuser');
  await page.fill('[name="login_form_password"]', 'password123');
  await page.click('[name="login_form_login"]');
  await page.click('[name="add_new_note"]');
  await page.fill('[name="text_input_new_note"]', 'This is a test note');
  await page.click('[name="text_input_save_new_note"]');
  
  const response = await page.waitForResponse(response => response.url().includes('/notes') && response.status() === 201);
  expect(response.ok()).toBeTruthy();
});


test('only logged in user can edit or delete note', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.fill('input[name="login_form_username"]', 'testuser');
  await page.fill('input[name="login_form_password"]', 'password123');
  await page.click('button[name="login_form_login"]');

  const user = await page.locator('.note').first();
  await expect(user.locator('button[name^="edit-"]')).toBeVisible();
  await expect(user.locator('button[name^="delete-"]')).toBeVisible();

  await page.click('button[name="logout"]');
  await page.fill('input[name="login_form_username"]', 'anotheruser');
  await page.fill('input[name="login_form_password"]', 'password123');
  await page.click('button[name="login_form_login"]');

  await expect(user.locator('button[name^="edit-"]')).toBeHidden();
  await expect(user.locator('button[name^="delete-"]')).toBeHidden();
});

test('guest cannot add new note', async ({ page }) => {
  await page.goto('http://localhost:3000');

  await expect(page.locator('button[name="add_new_note"]')).toBeHidden();
});
