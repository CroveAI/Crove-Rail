user = User.find_by(email: 'joy@crove.com')
if user
  puts "User found: #{user.email}"
  
  # Check if SuperAdmin exists
  super_admin = SuperAdmin.find_by(user_id: user.id)
  if super_admin
    puts "Already a super admin"
  else
    SuperAdmin.create!(user_id: user.id)
    puts "Promoted to super admin"
  end
else
  puts "User not found"
end