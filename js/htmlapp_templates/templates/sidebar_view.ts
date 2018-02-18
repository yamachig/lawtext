export default `

<style style="display: none;">
.lawtext-sidebar-view {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.lawtext-sidebar-view h1 {
  text-align: center;
  margin-top: 1rem;
  color: rgb(75, 75, 75);
}

.lawtext-sidebar-view .sidebar-head-block {
  flex-grow: 0;
  margin-bottom: 1rem;
}

.lawtext-sidebar-view .sidebar-body-block {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.lawtext-sidebar-view .law-nav-block {
  flex-grow: 1;
  flex-basis: 0;
  overflow-y: auto;
  border-top: 1px solid #d6d6d6;
  border-bottom: 1px solid #d6d6d6;
  padding: 0.4rem 0;
  font-size: 0.75em;
}

.lawtext-sidebar-view .toc-item {
  text-indent: -1em;
  overflow-x: hidden;
  overflow-y: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lawtext-sidebar-view .toc-item:hover {
  background-color: rgba(255, 255, 255, .8);
  cursor: pointer;
}

.list-group-item-sm {
  font-size: 0.8em;
  padding: 0.5em;
}

.lawtext-sidebar-view .sidebar-footer-block {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}
</style>

<div class="sidebar-head-block">
  <div class="container-fluid">

    <h1><a href="<%= location.protocol + '//' + location.host + location.pathname + location.search %>" style="color: inherit;">Lawtext</a></h1>

    <% if(!data.opening_file) { %>
      <div class="list-group" style="text-align: center;">

        <button class="lawtext-open-file-button list-group-item list-group-item-sm list-group-item-action">法令ファイルを開く</button>

        <form class="list-group-item list-group-item-sm" style="padding: 0;">
          <div class="input-group">
            <input name="law-query"
                  class="form-control form-control-sm search-law-textbox"
                  style="border: none; padding: 0.45em; border-radius: 0; border-bottom-left-radius: .25rem;"
                  placeholder="法令名か法令番号を検索" aria-label="法令名か法令番号を検索"
                  <% if(data.law_search_key) { %>value="<%= data.law_search_key %>"<% } %>
                  >
            <span class="input-group-btn">
              <button class="btn btn-sm btn-secondary search-law-button" type="submit"
                  style="border-radius: 0; border-bottom-right-radius: .25rem;"
                  >
                検索
              </button>
            </span>
          </div>
        </form>

      </div>
    <% } %>

    <% if(!_(data.law).isNull()) { %>
      <div style="margin-top: 0.5rem; display: flex;">
        <span style="font-size: .875rem; white-space: nowrap; padding-top: 5px;">保存：</span>
        <div>
            <span class="btn-group btn-group-sm">
              <button class="lawtext-download-docx-button btn btn-outline-primary">Word</button>
              <button class="lawtext-download-lawtext-button btn btn-outline-primary">Lawtext</button>
              <button class="lawtext-download-xml-button btn btn-outline-primary">法令XML</button>
            </span>
            <span class="btn-group btn-group-sm" style="margin-top: 0.2rem;">
              <button class="lawtext-download-docx-selected-button btn btn-outline-primary" style="padding: 0 8px;">Word（選択した条のみ）</button>
            </span>
        </div>
      </div>
    <% } %>

  </div>

</div>

<div class="sidebar-body-block">
<% if(!_(data.law).isNull()) { %>

  <div class="law-nav-block">

<% // <script>

var law_body = _(data.law.children).findWhere({tag: "LawBody"});

function process_law_body(law_body) {
    _(law_body.children).each(function(el){
        if(el.tag == "TOC") {
            process_toc(el);
        } if(el.tag == "MainProvision") {
          process_article_group(el, indent=0);
        } else if(el.tag == "SupplProvision") {
            process_suppl_provision(el);
        } else if(el.tag == "AppdxTable") {
            process_appdx_table(el);
        } else if(el.tag == "AppdxStyle") {
            process_appdx_style(el);
        }
    });
}

function process_toc(toc) {
    var toc_label = _(toc.children).findWhere({tag: "TOCLabel"});
    if(toc_label) {
        var name = toc_label.text;
        var obj = $("<div>")
            .addClass("toc-item law-link")
            .css({"padding-left": "2em"})
            .attr({"data-tag": toc.tag})
            .attr({"data-name": name})
            .attr({"title": name})
            .html(name);
        print(obj[0].outerHTML);
    }
}

function process_article_group(article_group, indent) {
    var article_group_title = _(article_group.children).findWhere({tag: article_group.tag + "Title"});
    if(article_group_title) {
      var name = article_group_title.text;
        var obj = $("<div>")
            .addClass("toc-item law-link")
            .css({"padding-left": (indent + 2) + "em"})
            .attr({"data-tag": article_group.tag})
            .attr({"data-name": name})
            .attr({"title": name})
            .html(name);
        print(obj[0].outerHTML);
    }

    _(article_group.children).each(function(el){
        if(_(['Part', 'Chapter', 'Section', 'Subsection', 'Division']).contains(el.tag)) {
            process_article_group(el, article_group.tag == "MainProvision" ? indent : indent + 1);
        } else if(el.tag == "Article") {
            process_article(el, article_group.tag == "MainProvision" ? indent : indent + 1);
        }
    });
}

function process_article(article, indent) {
    var article_caption = _(article.children).findWhere({tag: "ArticleCaption"});
    var article_title = _(article.children).findWhere({tag: "ArticleTitle"});

    if(article_title) {
        var name = article_title.text;
        var text = name;
        if(article_caption) {
            var append_text = article_caption.text;
            text += (append_text[0] == "（" ? "" : "　") + append_text;
        }
        var obj = $("<div>")
            .addClass("toc-item law-link")
            .css({"padding-left": (indent + 2) + "em"})
            .attr({"data-tag": article.tag})
            .attr({"data-name": name})
            .attr({"title": text})
            .html(text);
        print(obj[0].outerHTML);
    }
}

function process_suppl_provision(suppl_provision) {
    var suppl_provision_label = _(suppl_provision.children).findWhere({tag: "SupplProvisionLabel"});
    if(suppl_provision_label) {
        var name = suppl_provision_label.text;
        var amend_law_num = suppl_provision.attr["AmendLawNum"] || "";
        var text = name + (amend_law_num ? ("（" + amend_law_num + "）") : "");
        text = text.replace(/[\s　]+/, "");
        var obj = $("<div>")
            .addClass("toc-item law-link")
            .css({"padding-left": (indent + 2) + "em"})
            .attr({"data-tag": suppl_provision.tag})
            .attr({"data-name": name + amend_law_num})
            .attr({"title": text})
            .html(text);
        print(obj[0].outerHTML);
    }
}

function process_appdx_table(appdx_table) {
    var appdx_table_title = _(appdx_table.children).findWhere({tag: "AppdxTableTitle"});
    if(appdx_table_title) {
        var name = appdx_table_title.text;
        var obj = $("<div>")
            .addClass("toc-item law-link")
            .css({"padding-left": (indent + 2) + "em"})
            .attr({"data-tag": appdx_table.tag})
            .attr({"data-name": name})
            .attr({"title": name})
            .html(name);
        print(obj[0].outerHTML);
    }
}

function process_appdx_style(appdx_style) {
    var appdx_style_title = _(appdx_style.children).findWhere({tag: "AppdxStyleTitle"});
    if(appdx_style_title) {
        var name = appdx_style_title.text;
        var obj = $("<div>")
            .addClass("toc-item law-link")
            .css({"padding-left": (indent + 2) + "em"})
            .attr({"data-tag": appdx_style.tag})
            .attr({"data-name": name})
            .attr({"title": name})
            .html(name);
        print(obj[0].outerHTML);
    }
}

process_law_body(law_body);

// </script> %>
  </div>
<% } %>
</div>


<div class="sidebar-footer-block">
  <div style="font-size: 0.8em; text-align: center; padding: 0.3em 0; color: rgb(192, 192, 192)">
    <a href="https://github.com/yamachig/lawtext" target="_blank" style="margin-right: 2em;">
      GitHub
    </a>
    &copy; 2017-<%= new Date().getFullYear() %> yamachi
  </div>

</div>
`;