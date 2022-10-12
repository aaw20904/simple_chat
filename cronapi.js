import cron from 'cron';

class CronSheduler { 
	#commonInterfaces;  
	#cronFormatSrting;
	#cronJob;
	#jobStatus;
	#runProc = (arg) => {
		console.log(new Date().toLocaleTimeString());
	}

	constructor ( commonInterfaces={}) {
		this.#commonInterfaces = commonInterfaces; 
		this.#jobStatus = false;
	}



	#parseTimeString = (str="12:25:00") =>{
		let arr = str.split(':');
		let returned = {};
		  returned.hours = arr[0];
		returned.minutes = arr[1];
		returned.seconds = arr[2];
		return returned;
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
		switch (params.cln_period_unit) {
            case 0:
               //when minutes = run a task every 'cln_period' minutes every hour
               this.#cronFormatSrting = `0 */${params.cln_period} * ? * * `;//
            break;
            case 1:
              //when hours = run a task every 'cln_period' hours every day
               this.#cronFormatSrting = `0 0 */${params.cln_period} ? * * `;//
            break;
            case 2:
              //when days - run a task every  'cln_period' days at 'cln_start' time
			  let parsed = this.#parseTimeString(params.cln_start);
            //  `0 40 15 ? * * *` //At 15:40:00pm every day 
			 // `0 10 12 */3 *  *` //At 12:10:00pm, every 3 days starting on the 1st, every month 
			  this.#cronFormatSrting = `0 ${parsed.minutes} ${parsed.hours} */${params.cln_period} *  *`;
            break;
			default:
        }
		return this.#cronFormatSrting;

	}


	converter (a) {
		return this.#convertParamsToCronFormat({
				cln_period_unit: 2, // Auto-clean period units..  : 0-minutes, 1-hours, 2-days
				service_stat: 0, // 1-the autoclean srervice must running, 0-service must stopping 
				cln_start: '10:56:00', // time to start an autocleaning service when clean starting one times per day or rarely (for example 17:20:00)
				cln_period: 5, // Auto-clean period.. (an integer number)
			});
	}

	createCleanerInstance (options={
						cln_period_unit: 2, // Auto-clean period units..  : 0-minutes, 1-hours, 2-days
						service_stat: 0, // 1-the autoclean srervice must running, 0-service must stopping 
						cln_start: '20:55:00', // time to start an autocleaning service when clean starting one times per day or rarely (for example 17:20:00)
						cln_period: 1, // Auto-clean period.. (an integer number)						
					}) {
			//making crone opts
			let croneString = this.#convertParamsToCronFormat(options);
			//create a cron instance
			this.#cronJob = new cron.CronJob(croneString, this.#runProc);
			//when a service must to run
			if (options.service_stat === 1) {
				this.#cronJob.start();
				this.#jobStatus = true;
			}
	}

	startAutoClean () {
		if (! this.#jobStatus) {
			this.#cronJob.start();
			this.#jobStatus = true;
		}
	}

	stopAutoClean () {
		if ( this.#jobStatus) {
			this.#cronJob.stop();
			this.#jobStatus = false;
		}
	}

}

let x = new CronSheduler();
x.createCleanerInstance();
x.startAutoClean();