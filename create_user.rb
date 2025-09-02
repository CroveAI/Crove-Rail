account = Account.create!(name: 'Crove')
user = User.create!(
  email: 'joy@crove.com',
  password: 'Crove@2025',
  password_confirmation: 'Crove@2025',
  name: 'Joy'
)
AccountUser.create!(user: user, account: account, role: 'administrator')
puts "User created: #{user.email}"
puts "Account created: #{account.name}"