import xmlrpc.client
from typing import Any

from ...core.ports.external_services import OdooPort


class OdooAdapter(OdooPort):
    def _get_models(self, url: str, db: str, username: str, password: str):
        common = xmlrpc.client.ServerProxy(f"{url}/xmlrpc/2/common")
        uid = common.authenticate(db, username, password, {})
        if not uid:
            raise Exception("Authentication failed")
        return xmlrpc.client.ServerProxy(f"{url}/xmlrpc/2/object"), uid

    def test_connection(self, url: str, db: str, username: str, password: str) -> bool:
        common = xmlrpc.client.ServerProxy(f"{url}/xmlrpc/2/common")
        uid = common.authenticate(db, username, password, {})
        return bool(uid)

    def get_crons(self, url: str, db: str, username: str, password: str) -> list[Any]:
        models, uid = self._get_models(url, db, username, password)
        return models.execute_kw(
            db,
            uid,
            password,
            "ir.cron",
            "search_read",
            [[["active", "in", [True, False]]]],
            {
                "fields": [
                    "name",
                    "active",
                    "nextcall",
                    "interval_number",
                    "interval_type",
                ]
            },
        )

    def toggle_cron(
        self,
        url: str,
        db: str,
        username: str,
        password: str,
        cron_id: int,
        active: bool,
    ) -> Any:
        models, uid = self._get_models(url, db, username, password)
        return models.execute_kw(
            db,
            uid,
            password,
            "ir.cron",
            "write",
            [[cron_id], {"active": active}],
        )

    def run_cron(
        self, url: str, db: str, username: str, password: str, cron_id: int
    ) -> Any:
        models, uid = self._get_models(url, db, username, password)
        return models.execute_kw(
            db,
            uid,
            password,
            "ir.cron",
            "method_direct_trigger",
            [[cron_id]],
        )

    def execute_script(
        self, url: str, db: str, username: str, password: str, script: str
    ) -> Any:
        # script format: "model,method,args,kwargs" (JSON string for args/kwargs)
        import json

        try:
            parts = script.split("|")
            model = parts[0]
            method = parts[1]
            args = json.loads(parts[2]) if len(parts) > 2 else []
            kwargs = json.loads(parts[3]) if len(parts) > 3 else {}

            models, uid = self._get_models(url, db, username, password)
            return models.execute_kw(db, uid, password, model, method, args, kwargs)
        except Exception as e:
            return f"Error executing Odoo script: {str(e)}"

    def create_timesheet(
        self,
        url: str,
        db: str,
        username: str,
        password: str,
        project_id: int,
        task_id: int,
        name: str,
        hours: float,
    ) -> int:
        models, uid = self._get_models(url, db, username, password)
        return models.execute_kw(
            db,
            uid,
            password,
            "account.analytic.line",
            "create",
            [
                {
                    "project_id": project_id,
                    "task_id": task_id,
                    "name": name,
                    "unit_amount": hours,
                }
            ],
        )

    def get_disbursement_report(
        self, url: str, db: str, username: str, password: str
    ) -> list[Any]:
        from datetime import datetime

        try:
            models, uid = self._get_models(url, db, username, password)
            records = models.execute_kw(
                db,
                uid,
                password,
                "sale.disbursement",
                "search_read",
                [[["confirm_date", "!=", False], ["approve_date", "!=", False]]],
                {
                    "fields": [
                        "id",
                        "name",
                        "kind",
                        "confirm_date",
                        "approve_date",
                        "approve_uid",
                    ]
                },
            )

            for rec in records:
                try:
                    # Odoo returns UTC strings: 'YYYY-MM-DD HH:MM:SS'
                    confirm = datetime.strptime(
                        rec["confirm_date"], "%Y-%m-%d %H:%M:%S"
                    )
                    approve = datetime.strptime(
                        rec["approve_date"], "%Y-%m-%d %H:%M:%S"
                    )
                    duration = (approve - confirm).total_seconds() / 60.0
                    rec["approval_duration"] = duration
                except (ValueError, TypeError, KeyError):
                    rec["approval_duration"] = 0.0

            return records
        except Exception as e:
            print(f"Error fetching disbursement report: {e}")
            return []
