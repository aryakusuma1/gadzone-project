describe('Test Register - Gadzone', () => {

  // ========================================
  // REGISTER SUCCESS TEST
  // ========================================

  it('TC-REGISTER-001: User berhasil register dengan data yang valid', () => {
    // 1. Kunjungi halaman register
    cy.visit('http://localhost:4173/register')

    // Verifikasi di halaman register
    cy.url().should('include', '/register')
    cy.contains('Daftar').should('be.visible')

    // 2. Isi Nama Lengkap
    cy.get('input[placeholder="Masukkan nama lengkap"]').type('User Test Cypress')

    // 3. Isi Email (gunakan timestamp untuk unique email)
    const timestamp = Date.now()
    const testEmail = `usertest${timestamp}@gmail.com`
    cy.get('input[placeholder="Masukkan email Anda"]').type(testEmail)

    // 4. Isi Password
    cy.get('input[placeholder="Minimal 8 karakter"]').eq(0).type('password123')

    // 5. Isi Konfirmasi Password (sama dengan password)
    cy.get('input[placeholder="Ulangi password Anda"]').type('password123')

    // 6. Klik tombol Register/Daftar
    cy.get('button[type="submit"]').click()

    // Expected: Berhasil redirect ke login atau home
    cy.url({ timeout: 10000 }).should('satisfy', (url) => {
      return url.includes('/login') || url === 'http://localhost:4173/'
    })

    // Verifikasi success message atau redirect
    cy.get('body').should('satisfy', ($body) => {
      const text = $body.text()
      return text.includes('berhasil') ||
             text.includes('sukses') ||
             text.includes('Welcome') ||
             text.includes('Masuk')
    })
  })

  // ========================================
  // REGISTER FAIL TESTS
  // ========================================

  it('TC-REGISTER-002: User gagal register dengan email yang sudah terdaftar', () => {
    // 1. Kunjungi halaman register
    cy.visit('http://localhost:4173/register')

    // Verifikasi di halaman register
    cy.url().should('include', '/register')
    cy.contains('Daftar').should('be.visible')

    // 2. Isi Nama Lengkap
    cy.get('input[placeholder="Masukkan nama lengkap"]').type('User Existing')

    // 3. Isi Email yang SUDAH TERDAFTAR (email user arya)
    cy.get('input[placeholder="Masukkan email Anda"]').type('arya@gmail.com')

    // 4. Isi Password
    cy.get('input[placeholder="Minimal 8 karakter"]').eq(0).type('password123')

    // 5. Isi Konfirmasi Password
    cy.get('input[placeholder="Ulangi password Anda"]').type('password123')

    // 6. Klik tombol Register/Daftar
    cy.get('button[type="submit"]').click()

    // Tunggu response dari backend
    cy.wait(2000)

    // Expected: Tetap di halaman register dan muncul error message
    cy.url({ timeout: 5000 }).should('include', '/register')

    // Verifikasi error message muncul (email sudah digunakan)
    cy.get('.alert-danger, .invalid-feedback', { timeout: 5000 })
      .should('be.visible')
      .and('satisfy', ($el) => {
        const text = $el.text().toLowerCase()
        return text.includes('email') &&
               (text.includes('sudah') || text.includes('taken') || text.includes('digunakan'))
      })
  })

  it('TC-REGISTER-003: User gagal register ketika konfirmasi password tidak sesuai', () => {
    // 1. Kunjungi halaman register
    cy.visit('http://localhost:4173/register')

    // Verifikasi di halaman register
    cy.url().should('include', '/register')
    cy.contains('Daftar').should('be.visible')

    // 2. Isi Nama Lengkap
    cy.get('input[placeholder="Masukkan nama lengkap"]').type('User Test Password')

    // 3. Isi Email
    const timestamp = Date.now()
    const testEmail = `testpassword${timestamp}@gmail.com`
    cy.get('input[placeholder="Masukkan email Anda"]').type(testEmail)

    // 4. Isi Password
    cy.get('input[placeholder="Minimal 8 karakter"]').eq(0).type('password123')

    // 5. Isi Konfirmasi Password TIDAK SESUAI
    cy.get('input[placeholder="Ulangi password Anda"]').type('passwordtidaksesuai')

    // Expected: Button submit menjadi disabled karena password tidak cocok
    // Tunggu validasi frontend
    cy.wait(1000)

    // Verifikasi tombol submit disabled
    cy.get('button[type="submit"]').should('be.disabled')

    // Verifikasi tetap di halaman register
    cy.url().should('include', '/register')
  })

})
