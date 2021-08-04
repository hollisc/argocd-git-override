# argocd-git-override
Admission Controller to modify the git source for ArgoCD Applications

The problem this webhooks solves is that when you are working with a parent ArgoCD Applications that deploy a child ArgoCD Applications, you might need to change something in the child ArgoCD Application using a forked repo, you can't edit the child ArgoCD Application CR on the cluster because the parent App will revert your edit back to what's in git.

You can avoid this by adding an `ignoreDifference` in the ArgoCD config, but when you are dealing with more than 20 ArgoCD Applications and between parent and children, and a combination of git repositories it becomes hard to first find the correct ArgoCD corresponding to your git repo, this webhook allows you to create a simple mapping configmap to make sure that any ArgoCD Application points to your fork repos, this avoids your fork repos being polluted with your git URLs and keeping the upstream URLs.


## Install

- If not using ArgoCD operator edit the `argocd-cm` configMap
  ```yaml
  data:
    resource.customizations: |
      argoproj.io/Application:
        ignoreDifferences: |
          jsonPointers:
          - /spec/source/targetRevision
          - /spec/source/repoURL
  ```

- If using the ArgoCD operator then edit the instance of kind `ArgoCD`
  ```yaml
  spec:
    resourceCustomizations: |
      argoproj.io/Application:
        ignoreDifferences: |
          jsonPointers:
          - /spec/source/targetRevision
          - /spec/source/repoURL
  ```

- Configure which git repository and/or branch/revision you would like to override. Create a configmap with an array of git repositories to match as upstream and replace with origin, usually your fork.
  ```yaml
  cat <<EOF | oc apply -f -
  apiVersion: v1
  kind: ConfigMap
  metadata:
    name: argocd-git-override
    namespace: openshift-gitops
  data:
    map.yaml: |-
      map:
      - upstreamRepoURL: https://github.com/csantanapr/argocd-git-override.git
        originRepoUrL: https://github.com/fork/argocd-git-override.git
        originBranch: fork-branch
  EOF
  ```

- Deploy the deployment and service to OpenShift in the `openshift-gitops` namespace, or another namespace
  ```bash
  oc create -n openshift-gitops  -f https://github.com/csantanapr/argocd-git-override/releases/download/v1.0.0/deployment.yaml
  ```

- Deploy the  `MutatingWebhookConfiguration`, edit the yaml to specify a different namespace for the target service if you used a different namespace than `openshift-gitops` replace it with the namespace used in the previous step
  ```bash
  oc create -f https://github.com/csantanapr/argocd-git-override/releases/download/v1.0.0/webhook.yaml
  ```



- Activate webhook, by adding a label to the `openshift-gitops` namespace you deploy the webhook service
  ```bash
  oc label ns openshift-gitops cntk=experiment
  ```


## Development

- Change to the `openshift-gitops` namespace as context
  ```
  oc project openshift-gitops
  ```

- Run dev mode
  ```bash
  skaffold dev
  ```

- Test in another terminal
  ```bash
  oc create -f test/child/argocd.yaml --dry-run=server -o yaml
  ```




