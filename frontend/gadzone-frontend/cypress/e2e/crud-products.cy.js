describe('Test CRUD Products - Gadzone', () => {

  // Setup: Login dulu sebelum semua test
  beforeEach(() => {
    // Login sebagai user arya
    cy.visit('http://localhost:4173/login')
    cy.get('input[name="email"]').type('arya@gmail.com')
    cy.get('input[name="password"]').type('@arya1212')
    cy.get('button[type="submit"]').click()

    // Tunggu redirect ke home
    cy.url({ timeout: 10000 }).should('eq', 'http://localhost:4173/')
  })

  // ========================================
  // CREATE TESTS
  // ========================================

  it('TC-CREATE-001: User berhasil menambahkan produk baru dengan data dan gambar yang valid', () => {
    // 1. Klik menu navigasi "Products"
    cy.contains('Products').click()

    // 2. Klik tombol "+ Tambah Produk"
    cy.contains('Tambah Produk').click()

    // Verifikasi di halaman Tambah Produk
    cy.url().should('include', '/create')
    cy.contains('Tambah Produk').should('be.visible')

    // Tunggu form siap (kategori sudah ter-load)
    cy.get('select').should('exist')
    cy.get('select option').should('have.length.gt', 1) // Pastikan ada opsi kategori

    // 3. Isi Nama Produk
    cy.get('input[placeholder="Masukkan nama produk..."]').type('Samsung Galaxy S24')

    // 4. Isi Deskripsi
    cy.get('textarea[placeholder="Masukkan deskripsi produk..."]').type('Mencari pengalaman flagship Samsung dengan nilai terbaik? Samsung Galaxy S24 adalah jawabannya.')

    // 5. Isi Harga
    cy.get('input[placeholder="Masukkan harga produk..."]').type('9000000')

    // 6. Upload Gambar Produk
    cy.get('input[type="file"]').selectFile('cypress/fixtures/samsung-s24.jpg', { force: true })

    // 7. Pilih Kategori SAMSUNG
    cy.get('select').select('SAMSUNG')

    // 8. Klik tombol "Simpan"
    cy.contains('button', 'Simpan').click()

    // Expected: Muncul notifikasi sukses dan redirect ke daftar produk
    cy.contains('Produk berhasil ditambahkan', { timeout: 10000 }).should('be.visible')
    cy.url({ timeout: 10000 }).should('include', '/products')

    // Verifikasi produk baru terlihat di daftar
    cy.contains('Samsung Galaxy S24').should('be.visible')
    cy.contains('Rp 9000000').should('be.visible')
  })

  it('TC-CREATE-002: User gagal tambah produk jika Harga diisi dengan teks', () => {
    // 1. Klik menu navigasi "Products"
    cy.contains('Products').click()

    // 2. Klik tombol "+ Tambah Produk"
    cy.contains('Tambah Produk').click()

    // Verifikasi di halaman Tambah Produk
    cy.url().should('include', '/create')
    cy.contains('Tambah Produk').should('be.visible')

    // Tunggu form siap (kategori sudah ter-load)
    cy.get('select').should('exist')
    cy.get('select option').should('have.length.gt', 1)

    // 3. Isi Nama Produk
    cy.get('input[placeholder="Masukkan nama produk..."]').type('Samsung Galaxy Watch 8 Classic')

    // 4. Isi Deskripsi
    cy.get('textarea[placeholder="Masukkan deskripsi produk..."]').type('Memperkenalkan Samsung Galaxy Watch 8 Classic')

    // 5. Isi Harga dengan TEKS (bukan angka)
    cy.get('input[placeholder="Masukkan harga produk..."]').type('seratusribu')

    // 6. Pilih Kategori
    cy.get('select').select('SAMSUNG')

    // 7. Klik tombol "Simpan"
    cy.contains('button', 'Simpan').click()

    // Expected: Browser menampilkan notifikasi alert validasi
    // Karena input type="number" tidak menerima teks, field akan kosong
    // Browser akan menampilkan "Please fill out this field" saat submit
    cy.get('input[placeholder="Masukkan harga produk..."]:invalid').should('exist')
  })

  // ========================================
  // READ TEST
  // ========================================

  it('TC-READ-001: User dapat melihat daftar produk', () => {
    // 1. Klik menu navigasi "Products"
    cy.contains('Products').click()

    // Verifikasi di halaman Daftar Produk
    cy.url().should('include', '/products')
    cy.contains('Daftar Produk').should('be.visible')

    // Expected: Daftar produk tampil (minimal ada 1 produk)
    cy.get('.product-item').should('have.length.greaterThan', 0)

    // Verifikasi elemen produk tampil
    cy.get('.product-name').should('be.visible')
    cy.get('.product-price').should('be.visible')
    cy.get('.product-category').should('be.visible')
  })

  // ========================================
  // UPDATE TESTS
  // ========================================

  it('TC-UPDATE-001: User berhasil mengupdate produk', () => {
    // 1. Klik menu navigasi "Products"
    cy.contains('Products').click()

    // Tunggu halaman products load
    cy.url().should('include', '/products')
    cy.contains('Daftar Produk').should('be.visible')

    // 2. Cari produk "Samsung Galaxy S24" yang baru saja ditambahkan
    cy.contains('.product-name', 'Samsung Galaxy S24', { timeout: 10000 })
      .should('be.visible')
      .parents('.product-item')
      .within(() => {
        // 3. Klik ikon titik tiga (action menu)
        cy.get('.action-menu-btn').click()

        // 4. Klik tombol "Edit"
        cy.contains('Edit').click()
      })

    // Verifikasi di halaman Edit Produk
    cy.url().should('include', '/edit/')
    cy.contains('Edit Produk').should('be.visible')

    // ✅ TUNGGU sampai data produk terload dari API
    // Edit.vue menggunakan class="form-control", bukan placeholder!
    cy.get('input[type="text"].form-control', { timeout: 15000 })
      .should('exist')
      .and('be.visible')
      .and('have.value', 'Samsung Galaxy S24')

    // Tunggu input Harga terisi (input type="number")
    cy.get('input[type="number"].form-control', { timeout: 15000 })
      .should('exist')
      .and('be.visible')
      .then(($input) => {
        cy.wrap($input).should(($el) => {
          expect($el.val()).to.not.be.empty
        })
      })

    // 5. Ubah Harga dari 9000000 jadi 8500000
    cy.get('input[type="number"].form-control').clear().type('8500000')

    // 6. Klik tombol "Update"
    cy.contains('button', 'Update').click()

    // Expected: Notifikasi sukses dan harga berubah
    cy.contains('Produk berhasil diperbarui', { timeout: 10000 }).should('be.visible')
    cy.url({ timeout: 10000 }).should('include', '/products')

    // Verifikasi harga berubah di daftar
    cy.contains('Rp 8500000').should('be.visible')
  })

  it('TC-UPDATE-002: User gagal update produk jika field Harga kosong', () => {
    // Asumsi: Produk "Apple iPhone 16" sudah ada di database

    // 1. Klik menu navigasi "Products"
    cy.contains('Products').click()

    // Tunggu halaman products load
    cy.url().should('include', '/products')
    cy.contains('Daftar Produk').should('be.visible')

    // 2. Cari produk Apple iPhone 16
    cy.contains('.product-name', 'Apple iPhone 16')
      .parents('.product-item')
      .within(() => {
        // 3. Klik ikon titik tiga
        cy.get('.action-menu-btn').click()

        // 4. Klik tombol "Edit"
        cy.contains('Edit').click()
      })

    // Verifikasi di halaman Edit
    cy.url().should('include', '/edit/')
    cy.contains('Edit Produk').should('be.visible')

    // ✅ TUNGGU sampai data produk terload dari API
    // Edit.vue menggunakan class="form-control", bukan placeholder!
    cy.get('input[type="text"].form-control', { timeout: 15000 })
      .should('exist')
      .and('be.visible')
      .and('have.value', 'Apple iPhone 16')

    // Tunggu input Harga terisi
    cy.get('input[type="number"].form-control', { timeout: 15000 })
      .should('exist')
      .and('be.visible')
      .then(($input) => {
        cy.wrap($input).should(($el) => {
          expect($el.val()).to.not.be.empty
        })
      })

    // 5. Hapus nilai Harga (biarkan kosong)
    cy.get('input[type="number"].form-control').clear()

    // 6. Klik tombol "Update"
    cy.contains('button', 'Update').click()

    // Expected: Browser alert "Please fill out this field"
    cy.get('input[type="number"].form-control:invalid').should('exist')

    // Halaman tidak berpindah (masih di halaman edit)
    cy.url().should('include', '/edit/')
  })

  // ========================================
  // DELETE TESTS
  // ========================================

  it('TC-DELETE-001: User berhasil menghapus produk', () => {
    // 1. Klik menu navigasi "Products"
    cy.contains('Products').click()

    // Tunggu halaman products load
    cy.url().should('include', '/products')
    cy.contains('Daftar Produk').should('be.visible')

    // Tunggu daftar produk selesai dimuat
    cy.wait(1000)

    // 2. Cari produk "Samsung Galaxy S24"
    cy.contains('.product-name', 'Samsung Galaxy S24', { timeout: 10000 })
      .should('be.visible')
      .parents('.product-item')
      .within(() => {
        // 3. Klik ikon titik tiga
        cy.get('.action-menu-btn').click()

        // Tunggu dropdown muncul
        cy.wait(500)

        // 4. Klik tombol "Hapus"
        cy.contains('Hapus').should('be.visible').click()
      })

    // Tunggu delete API call selesai dan UI update
    cy.wait(2000)

    // Expected: Produk langsung hilang dari daftar
    cy.contains('.product-name', 'Samsung Galaxy S24').should('not.exist')
  })

  it('TC-DELETE-002: User tidak bisa akses halaman Products tanpa login', () => {
    // 1. Logout dulu
    cy.get('#userDropdown').click() // Klik dropdown user
    cy.contains('Logout').should('be.visible').click() // Klik logout

    // Tunggu logout process selesai (API call, clear storage, redirect)
    cy.wait(2000)

    // Tunggu redirect ke home page (setelah logout redirect ke /)
    cy.url({ timeout: 10000 }).should('eq', 'http://localhost:4173/')
    cy.contains('Welcome to Gadzone', { timeout: 5000 }).should('be.visible')

    // Pastikan user benar-benar logout (cek localStorage/auth state)
    cy.window().then((win) => {
      // Pastikan token dihapus
      expect(win.localStorage.getItem('token')).to.be.null
    })

    // 2. Coba akses halaman Products langsung via URL
    cy.visit('http://localhost:4173/products')

    // Expected: Redirect ke halaman Login (karena ada auth guard)
    cy.url({ timeout: 10000 }).should('include', '/login')
    cy.contains('Masuk').should('be.visible')
  })

})
