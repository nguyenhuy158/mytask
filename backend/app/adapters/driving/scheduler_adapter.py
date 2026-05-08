import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

logger = logging.getLogger(__name__)


class SchedulerAdapter:
    def __init__(self, task_service, backup_service):
        self.scheduler = AsyncIOScheduler()
        self.task_service = task_service
        self.backup_service = backup_service

    def start(self):
        self.scheduler.start()

    def schedule_task(self, task_id, cron_expr, task_name):
        job_id = f"task_{task_id}"
        if self.scheduler.get_job(job_id):
            logger.debug(f"Removing existing job: {job_id}")
            self.scheduler.remove_job(job_id)
        if cron_expr:
            try:
                self.scheduler.add_job(
                    self.task_service.execute_task,
                    CronTrigger.from_crontab(cron_expr),
                    id=job_id,
                    args=[task_id],
                )
                logger.info(
                    f"Scheduled task {task_id} ({task_name}) with cron: {cron_expr}"
                )
            except Exception as e:
                logger.error(f"Failed to schedule task {task_id}: {e}")

    def remove_task(self, task_id):
        job_id = f"task_{task_id}"
        if self.scheduler.get_job(job_id):
            self.scheduler.remove_job(job_id)

    def schedule_backup(self, cron_expr):
        if self.scheduler.get_job("backup_db"):
            logger.debug("Removing existing backup job")
            self.scheduler.remove_job("backup_db")
        try:
            self.scheduler.add_job(
                self.backup_service.run_backup_job,
                CronTrigger.from_crontab(cron_expr),
                id="backup_db",
            )
            logger.info(f"Scheduled backup job with cron: {cron_expr}")
        except Exception as e:
            logger.error(f"Failed to schedule backup job: {e}")

    def get_jobs(self):
        return self.scheduler.get_jobs()
