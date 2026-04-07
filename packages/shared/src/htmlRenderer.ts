import ejs from 'ejs';
import { ResponseBody } from './response.js';

interface IndexViewModel {
  readonly resources: ReadonlyArray<string>;
}

interface NewResourceViewModel {
  readonly errors: ReadonlyArray<string>;
}

const INDEX_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Shadow</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.classless.min.css" />
</head>
<body>
  <main>
    <h1>Shadow</h1>
    <% if (resources.length === 0) { %>
      <p>No resources yet. Get started by creating one.</p>
      <a href="/new-resource">Create new resource</a>
    <% } else { %>
      <section>
        <h2>Resources</h2>
        <ul>
          <% resources.forEach(function(r) { %>
            <li><%= r %></li>
          <% }); %>
        </ul>
        <a href="/new-resource">Create new resource</a>
      </section>
    <% } %>
  </main>
</body>
</html>`;

const NEW_RESOURCE_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Resource – Shadow</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.classless.min.css" />
</head>
<body>
  <main>
    <h1>New Resource</h1>
    <% if (errors.length > 0) { %>
      <article>
        <ul>
          <% errors.forEach(function(e) { %>
            <li><%= e %></li>
          <% }); %>
        </ul>
      </article>
    <% } %>
    <form method="POST" action="/">
      <label for="name">Resource name</label>
      <input id="name" name="name" type="text" required placeholder="my-resource" />
      <label for="body">Template</label>
      <textarea id="body" name="body" rows="20" required placeholder="{{! mustache template }}"></textarea>
      <button type="submit">Save</button>
    </form>
    <a href="/">Cancel</a>
  </main>
</body>
</html>`;

export class HtmlRenderer {
  renderIndex(viewModel: IndexViewModel): ResponseBody {
    return ResponseBody.of(ejs.render(INDEX_TEMPLATE, viewModel));
  }

  renderNewResource(viewModel: NewResourceViewModel): ResponseBody {
    return ResponseBody.of(ejs.render(NEW_RESOURCE_TEMPLATE, viewModel));
  }
}
