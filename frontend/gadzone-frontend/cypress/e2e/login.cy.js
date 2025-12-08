describe('Test Login - Gadzone', () => {

  // ========================================
  // LOGIN SUCCESS TEST
  // ========================================

  it('TC-LOGIN-001: User berhasil login dengan email dan password yang valid', () => {
    // 1. Kunjungi halaman login
    cy.visit('http://localhost:4173/login')

    // Verifikasi di halaman login
    cy.url().should('include', '/login')
    cy.contains('Masuk').should('be.visible')

    // 2. Isi email yang valid
    cy.get('input[name="email"]').type('arya@gmail.com')

    // 3. Isi password yang valid
    cy.get('input[name="password"]').type('@arya1212')

    // 4. Klik tombol login
    cy.get('button[type="submit"]').click()

    // Expected: Berhasil redirect ke home page
    cy.url({ timeout: 10000 }).should('eq', 'http://localhost:4173/')

    // Verifikasi ada di halaman home (teks Welcome tampil)
    cy.contains('Welcome to Gadzone', { timeout: 5000 }).should('be.visible')

    // Verifikasi nama user tampil di navbar
    cy.contains('Hi, arya').should('be.visible')
  })

  // ========================================
  // LOGIN FAIL TESTS
  // ========================================

  it('TC-LOGIN-002: User gagal login dengan password yang salah', () => {
    // 1. Kunjungi halaman login
    cy.visit('http://localhost:4173/login')

    // Verifikasi di halaman login
    cy.url().should('include', '/login')
    cy.contains('Masuk').should('be.visible')

    // 2. Isi email yang valid
    cy.get('input[name="email"]').type('arya@gmail.com')

    // 3. Isi password yang SALAH
    cy.get('input[name="password"]').type('passwordsalah123')

    // 4. Klik tombol login
    cy.get('button[type="submit"]').click()

    // Tunggu response dari backend
    cy.wait(2000)

    // Expected: Tetap di halaman login dan muncul error message
    cy.url({ timeout: 5000 }).should('include', '/login')

    // Verifikasi error message muncul
    cy.get('.alert-danger', { timeout: 5000 })
      .should('be.visible')
      .and('contain.text', 'Email atau password yang Anda masukkan salah')
  })

  it('TC-LOGIN-003: User gagal login dengan email yang tidak terdaftar', () => {
    // 1. Kunjungi halaman login
    cy.visit('http://localhost:4173/login')

    // Verifikasi di halaman login
    cy.url().should('include', '/login')
    cy.contains('Masuk').should('be.visible')

    // 2. Isi email yang TIDAK TERDAFTAR
    cy.get('input[name="email"]').type('emailtidakterdaftar@gmail.com')

    // 3. Isi password
    cy.get('input[name="password"]').type('@arya1212')

    // 4. Klik tombol login
    cy.get('button[type="submit"]').click()

    // Tunggu response dari backend
    cy.wait(2000)

    // Expected: Tetap di halaman login dan muncul error message
    cy.url({ timeout: 5000 }).should('include', '/login')

    // Verifikasi error message muncul
    cy.get('.alert-danger', { timeout: 5000 })
      .should('be.visible')
      .and('contain.text', 'Email atau password yang Anda masukkan salah')
  })

})
