import cron from 'cron';

class cronSheduler { 
	#commonInterfaces;  
	#cronFormatSrting;
	#runProc = (arg) => {
		console.log(new Date().toLocaleTimeString());
	}
	constructor ( commonInterfaces={}) {
		this.#commonInterfaces = commonInterfaces;
	}

	#convertParamsToCronFormat = (params={
		cln_threshold_unit: 0, // Remove older that: 0-hours, 1 - days (when remove process will run)
		cln_threshold: 0, // Cleaning options: remove older that... (integer)
		cln_period_unit: 0, // Auto-clean period units..  : 0-minutes, 1-hours, 2-days
		service_stat: 0, // 1-the autoclean srervice must running, 0-service must stopping 
		cln_start: 0, // time to start an autocleaning service when clean starting one times per day or rarely (for example 17:20:00)
		
		cln_period: 0, // Auto-clean period.. (an integer number)
	})=>{
		

	}

}


var job = new cron.CronJob(
	'*/7 * * * * *',
	function() {
		console.log(`${new Date().toLocaleTimeString()}`);
		job.stop();
	},
	null,
	true,
	'America/Los_Angeles'
);
// Use this if the 4th param is default value(false)
// job.start(