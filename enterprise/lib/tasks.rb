# Load enterprise rake tasks only when invoked via `rake`, not during app boot.
module Tasks
  if File.basename($PROGRAM_NAME) == 'rake'
    Dir.glob(File.join(File.dirname(__FILE__), 'tasks', '*.rake')).each { |r| load r }
  end
end
