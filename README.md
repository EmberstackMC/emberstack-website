# Emberstack site

Static landing page for Emberstack. Open `index.html` for a local preview or publish this folder with a static host such as GitHub Pages.

## Add official links

Edit `site-config.js` and replace the empty strings in `window.EMBERSTACK_LINKS` with verified URLs:

- `modrinth`: Emberstack's Modrinth organization or profile.
- `github`: Emberstack's GitHub organization.
- `discord`: the public invite link.
- `githubIssues`: the preferred issue tracker for bug reports.
- `featureRequests`: a feature-request page or form. This is reserved for a future separate entry point; the current community link goes to GitHub.

The page disables links whose URL is blank, so no visitor is sent to an invented destination.

## Add projects

Add verified entries to `window.EMBERSTACK_CONTENT.projects` in `site-config.js`. The catalog search and filters, project detail dialog, version/loader tags, and download links are generated from these entries.

```js
{
  name: "Project name",
  status: "available", // available | development | consideration
  statusLabel: "Available now",
  type: "Mod",
  description: "A short catalog description.",
  details: "Longer detail shown in the project dialog.",
  versions: ["1.21.1"],
  loaders: ["Fabric"],
  modrinthUrl: "https://modrinth.com/mod/example",
  githubUrl: "https://github.com/Emberstack/example",
  installNotes: "Any project-specific installation or dependency notes."
}
```

`image` and `imageAlt` are optional. Use a relative asset path or a trusted public image URL. Only include current, verified version and loader values. An empty project list displays a launch-ready empty state.

## Add changelog entries

Add objects to `window.EMBERSTACK_CONTENT.updates`:

```js
{
  date: "2026-10-11",
  category: "RELEASE",
  title: "Update title",
  summary: "A concise description of the change.",
  project: "Project name"
}
```

Entries sort newest first. The roadmap currently uses honest high-level empty states; replace them only when Emberstack has real plans to announce.

## Publish with GitHub Pages

For a separate website repository, put these files at the repository root, then select **Settings → Pages → Deploy from a branch**, choose the default branch and `/(root)`, and save. GitHub Pages publishes the selected branch/folder when it changes. For an existing repository, copy the site contents into a supported publishing folder such as `/docs`, or use a GitHub Actions workflow. See [GitHub's publishing-source guide](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).
