.PHONY: install uninstall start stop status backup restore

install:
	@bash install.sh

uninstall:
	@bash uninstall.sh

start:
	systemctl start crm-supermercado

stop:
	systemctl stop crm-supermercado

status:
	systemctl status crm-supermercado

restart:
	systemctl restart crm-supermercado

backup:
	@bash backup.sh

restore:
	@bash restore.sh $(FILE)

logs:
	journalctl -u crm-supermercado -f
