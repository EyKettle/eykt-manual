local info = debug.getinfo(1, "S")
local source = info and info.source
if not source then
	error("cannot resolve .nvim.lua source")
end

local root = vim.fs.dirname(vim.fs.normalize(vim.fn.fnamemodify(source:sub(2), ":p")))

local function under_root(name)
	name = vim.fs.normalize(name)
	return name:sub(1, #root + 1) == root .. "/"
end

local function root_dir(bufnr, on_dir)
	if under_root(vim.api.nvim_buf_get_name(bufnr)) then
		on_dir(root)
	end
end

local oxlint = vim.fs.joinpath(root, "node_modules", ".bin", "oxlint")
if vim.fn.executable(oxlint) == 1 then
	vim.lsp.config("oxlint", {
		cmd = { oxlint, "--lsp" },
		cmd_cwd = root,
		filetypes = { "javascript", "javascriptreact", "typescript", "typescriptreact" },
		root_dir = root_dir,
	})
	vim.lsp.enable("oxlint")
end

local oxfmt = vim.fs.joinpath(root, "node_modules", ".bin", "oxfmt")
if vim.fn.executable(oxfmt) == 1 then
	vim.lsp.config("oxfmt", {
		cmd = { oxfmt, "--lsp" },
		cmd_cwd = root,
		filetypes = { "javascript", "javascriptreact", "typescript", "typescriptreact" },
		root_dir = root_dir,
	})
	vim.lsp.enable("oxfmt")
end

vim.api.nvim_create_autocmd("BufWritePre", {
	group = vim.api.nvim_create_augroup("eykt-ui.format", { clear = true }),
	pattern = { "*.js", "*.jsx", "*.ts", "*.tsx" },
	callback = function(args)
		if not under_root(vim.api.nvim_buf_get_name(args.buf)) then
			return
		end
		if #vim.lsp.get_clients({ bufnr = args.buf, name = "oxfmt" }) == 0 then
			return
		end
		vim.lsp.buf.format({ bufnr = args.buf, name = "oxfmt", async = false })
	end,
})

local eykt_ui_root = vim.uv.fs_realpath(root .. "/node_modules/eykt-ui")
local css_config = {
	cmd = { "css-variable-lsp" },
	filetypes = { "css", "scss", "html" },
	root_dir = root_dir,
}
if eykt_ui_root then
	local function workspace_folder(path)
		return {
			uri = vim.uri_from_fname(path),
			name = vim.fs.basename(path),
		}
	end

	css_config.workspace_folders = {
		workspace_folder(root),
		workspace_folder(eykt_ui_root),
	}
else
	vim.notify("css-variable-lsp: cannot resolve node_modules/eykt-ui", vim.log.levels.WARN)
end

vim.lsp.config("css_variable_lsp", css_config)
vim.lsp.enable("css_variable_lsp")
