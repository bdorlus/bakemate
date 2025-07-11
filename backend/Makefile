.PHONY: run install test help setup lint

VENV_DIR = .venv
PYTHON=${VENV_DIR}/bin/python
export PYTHONPATH := .:$(PYTHONPATH)

# Help target to display available commands with descriptions
help:
	@echo "Available commands:"
	@echo
	@echo "  setup           Setup the virtual environment and install dependencies."
	@echo "  test <unittest> Run tests."
	@echo "  lint            Run linter black on codebase"
	@echo "  run             Run the software."
	@echo "  clean           Remove build artifacts and temporary files."
	@echo "  environment     Print out the current environment."
	@echo "  all             Run setup, test, build, and then run."
	@echo
	@echo "Use 'make <target>' to run a specific command."

# Setup the virtual environment and install requirements
setup:
	test -d $(VENV_DIR) || python3 -m venv $(VENV_DIR)
	${PYTHON} -m pip install --quiet --upgrade pip
	${PYTHON} -m pip install --quiet -r requirements.txt

activate:
	@echo "Activating virtual environment at $(VENV_DIR)"

# Run the application
run: activate setup
	$(VENV_DIR)/bin/uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Run tests
test: activate setup
	$(VENV_DIR)/bin/pytest -v --cov=app tests/$(filter-out $@,$(MAKECMDGOALS))

# Allow additional arguments such as `make test unit` without requiring
# explicit targets for them. The trailing rule consumes any unknown
# target names so they can be passed through to pytest via MAKECMDGOALS.
%:
	@:

# Clean build artifacts and temporary files
clean:
	@echo "Clean build virtual environment at $(VENV_DIR)"
	test -d $(VENV_DIR) && rm -rf $(VENV_DIR)/

# Run lint using black library
lint: setup
	$(VENV_DIR)/bin/black app/ tests/ tools/ scripts/

