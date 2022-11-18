let  cron = require('cron');

module.exports =   class CleanScheduler { 
 
	constructor (appLayers) {
		//declare private variable
		this.privateMembers = new WeakMap();
		//assign private members
		let privMemb = {
			_layers77: appLayers,
			cronFormatSrting: null,
			cronJob: false,
			jobStarus: false,

			runProc: async (arg) => {
				try {
					console.log(`Clean chat at ${new Date().toLocaleTimeString()}`);
					//start autoclean process MUST UPDATED!
					let rs = await privMemb._layers77.databaseLayer.removeOlderThat(120);
					//notify all the WebSockets to update
					privMemb._layers77.websocketLayer.notifyAllTheClientsToUpdate();
					console.log(rs);
					
				} catch (e) {
					console.log(e);
				}
		
			},

			parseTimeString: (str="12:25:00") =>{
				let arr = str.split(':');
				let returned = {};
				returned.hours = arr[0];
				returned.minutes = arr[1];
				returned.seconds = arr[2];
				return returned;
			},

			convertParamsToCronFormat: (params={
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
						privMemb.cronFormatSrting = `0 */${params.cln_period} * * * *`;//
							
						break;
						case 1:
						//when hours = run a task every 'cln_period' hours every day
							privMemb.cronFormatSrting = `0 0 */${params.cln_period} * * *`;//
						
						break;
						case 2:
						//when days - run a task every  'cln_period' days at 'cln_start' time
						let parsed = privMemb.parseTimeString(params.cln_start);
						//  `0 40 15 ? * * *` //At 15:40:00pm every day 
						// `0 10 12 */3 *  *` //At 12:10:00pm, every 3 days starting on the 1st, every month 
						privMemb.cronFormatSrting = `${parsed.seconds} ${parsed.minutes} ${parsed.hours} */${params.cln_period} *  *`;
						break;
						default:
				}
				return privMemb.cronFormatSrting;

			},

		}
		//assign it
		this.privateMembers.set(this, privMemb);
		 
	}


	createCleanerInstance (options={
						cln_period_unit: 0, // Auto-clean period units..  : 0-minutes, 1-hours, 2-days
						service_stat: 1, // 1-the autoclean srervice must running, 0-service must stopping 
						cln_start: '11:18:00', // time to start an autocleaning service when clean starting one times per day or rarely (for example 17:20:00)
						cln_period: 1, // Auto-clean period.. (an integer number)						
					}) {
			let pm = this.privateMembers.get(this);
			//reset status
			pm.jobStatus = false;
			//making crone opts
			let croneString = pm.convertParamsToCronFormat(options);
			//create a cron instance
			pm.cronJob = new cron.CronJob(croneString, pm.runProc);
			//when a service must to run
			if (options.service_stat === 1) {
				pm.cronJob.start();
				pm.jobStatus = true;
			}
	}

	startAutoClean () {
	let pm = this.privateMembers.get(this);
		if (! pm.jobStatus) {
			pm.cronJob.start();
			pm.jobStatus = true;
		}
	}

	stopAutoClean () {
	  let pm = this.privateMembers.get(this);
		if ( pm.jobStatus) {
			pm.cronJob.stop();
			pm.jobStatus = false;
		}
	}

}
 