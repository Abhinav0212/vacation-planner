FROM docker-registry.tools.expedia.com/stratus/primer-base-springboot:8-2.1

# Install application
COPY target/vacation-planner.war /app/bin/
