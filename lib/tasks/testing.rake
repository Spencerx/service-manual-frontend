namespace :test do
  desc "Runs contract tests"
  task contracts: "test:prepare" do |t|
    t.pattern = "test/contracts/**/*_test.rb"
  end

  task presenters: "test:prepare" do |t|
    t.pattern = "test/presenters/**/*_test.rb"
  end
end

Rake::Task["test:run"].enhance ["test:contracts", "test:presenters"]
Rake::Task[:test].comment = "Includes test:contracts and test:presenters"

Rake::Task[:default].enhance ["spec:javascript"]
