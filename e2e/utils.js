/* eslint-disable flowtype/require-valid-file-annotation */
/* globals device expect element by */

export const sleep = async milliseconds => {
  new Promise(resolve => setTimeout(resolve, milliseconds)) // eslint-disable-line no-new
}

export const navigateToHome = async () => {
  // NAVIGATE TO HOME
  const loginScene = element(by.id('edge: login-scene'))
  const exitPinButton = element(by.text('EXIT PIN'))

  // App opens on pin screen with previous signup/login
  await expect(loginScene).toExist()
  await expect(exitPinButton).toExist()
  await exitPinButton.tap()
}

export const navigateToLanding = async () => {
  // NAVIGATE TO LANDING
  const loginScene = element(by.id('edge: login-scene'))
  const exitPinButton = element(by.text('Exit PIN'))
  const createAccountButton = element(by.text('Create an Account'))
  const exitButton = element(by.text('Exit'))

  // App opens on pin screen with previous signup/login
  await expect(loginScene).toExist()
  await expect(exitPinButton).toExist()
  await exitPinButton.tap()

  // After exiting pin, the login screen shows, tap create account
  await expect(createAccountButton).toExist()
  await createAccountButton.tap()

  // tap exit
  await expect(exitButton).toExist()
  await exitButton.tap()
}

export const launchAppWithPermissions = async () => {
  await device.launchApp({
    permissions: {
      notifications: 'YES',
      camera: 'YES',
      contacts: 'YES'
    }
  })
}
