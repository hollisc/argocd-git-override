# argocd-git-override
Admission Controller to modify the git source for ArgoCD Applications


Set to ignore git source in `argocd-cm` configMap

```yaml
data:
  resource.customizations: |
    argoproj.io/Application:
      ignoreDifferences: |
        jsonPointers:
        - /spec/source/targetRevision
```

If using the ArgoCD operator then edit the instance of kinkd `ArgoCD`

```yaml
spec:
  resourceCustomizations: |
    argoproj.io/Application:
      ignoreDifferences: |
        jsonPointers:
        - /spec/source/targetRevision
```