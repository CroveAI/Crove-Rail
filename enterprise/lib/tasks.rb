# Load all rake tasks from the enterprise/lib/tasks directory
# Guard so this only runs under rake, not during app boot/eager load
module Tasks
  if defined?(Rake) && defined?(Rake.application)
    Dir.glob(File.join(File.dirname(__FILE__), 'tasks', '*.rake')).each { |r| load r }
  end
end
