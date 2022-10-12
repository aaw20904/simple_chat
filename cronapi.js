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
		cln_threshold_unit: 0, //NOT USED! Remove older that: 0-hours, 1 - days (when remove process will run)
		cln_threshold: 0, //NOT USED! Cleaning options: remove older that... (integer)
        ///actual params
		cln_period_unit: 0, // Auto-clean period units..  : 0-minutes, 1-hours, 2-days
		service_stat: 0, // 1-the autoclean srervice must running, 0-service must stopping 
		cln_start: 0, // time to start an autocleaning service when clean starting one times per day or rarely (for example 17:20:00)
		cln_period: 0, // Auto-clean period.. (an integer number)
	})=>{
		switch (cln_period_unit) {
            case 0:
               //when minutes = run a task every 'cln_period' minutes every hour
               this.#cronFormatSrting = `0 */${cln_period} * ? * * *`;//
            break;
            case 1:
              //when hours = run a task every 'cln_period' hours every day
               this.#cronFormatSrting = `0 0 */${cln_period} ? * * *`;//
            break;
            case 2:
              //when days - run a task every  'cln_period' days at 'cln_start' time
              `0 40 15 ? * * *` //At 15:40:00pm every day 
            break;
        }

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