# Asgard Helm chart

This chart packages the same services defined in the repository's Docker Compose file:

- `asgard-api`
- `asgard-jobs`
- `asgard-admin`
- `db`
- `mqtt`

## Install

Install the chart from the repository root:

```bash
helm install asgard ./helm/asgard -f ./helm/asgard/values.example.yaml
```

The chart uses a ConfigMap and Secret to pass the same environment variables that are currently supplied through the Compose `.env` file. The example values file shows a complete sample of the current environment variables.

## Configuration

The chart exposes the environment variables from the current Compose setup through the `env` and `secretEnv` values. Update `values.example.yaml` (or provide your own values file) to match your environment before installing the chart.

## Notes

The chart defaults to internal service names such as `{{ .Release.Name }}-api` and `{{ .Release.Name }}-mqtt` for inter-service communication, while the public-facing URLs are still configurable through the supplied values.
