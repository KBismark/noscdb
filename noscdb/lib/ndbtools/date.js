var mth = ["January","February","March","April","May","June","July","August","September","October","November","December"];
/**
 * 
 * Returns a date object.
 */
function date(){
    const d = {};
    var dt=new Date();
    var dtt = dt.toString().split(" ");
    d.day = Number(dtt[2]);
    d.month = dt.getUTCMonth()+1;
    d.year = dt.getUTCFullYear();
    d.hour = dt.getHours();
    d.minute = dt.getMinutes();
    d.second = dt.getSeconds();
    d.formart = dt.toUTCString().split(" ").pop();
    d.dayToWord = dtt[0];
    d.monthToWord = dtt[1];
    d.monthToFullword = mth[d.month-1];
    d.time = d.hour+":"+d.minute+":"+d.second;
    d.stamp=d.year+":"+d.month+":"+d.day+"-"+d.time+"-"+d.formart;
    dtt=null;
    return d;
};
function oneOrmore(num,str){
    if(num>1){
        str+="s";
    }
    return num+""+str+" ago";
};
function det_ret(ret,r1,r2,div,main,alt,r11,r22){
    if(r2<r1){
        ret-=1;
    }
    if(r2==r1){
        if(typeof (r22)==="number"){
            if(r22<r11){
                ret-=1;
            }
        }
    }
    if(ret==0){
        var r=(div-r1)+r2;
        if(r>=div){
            return oneOrmore(1," "+main);
        };
        return oneOrmore(r," "+alt);
    };
    return oneOrmore(ret," "+main);
};

/**
 * Rounds up date by 1 second.
 * @param {{year:number,month:number,day:number,hour:number,minute:number,second:number,formart:string}} o 
*/
function roundUpDate(o){
    o.second++;
    if(o.second>=60){
        o.second=0;
        o.minute++;
        if(o.minute>=60){
            o.minute=0;
            o.hour++;
            if(o.hour>=24){
                o.hour=0;
                o.day++;
                if(o.month===4||o.month===6||o.month===9||o.month===11){
                    if(o.day>=31){
                        o.day=1;
                        o.month++;
                    }
                }else if(o.month===2){
                    if(o.year%4===0){
                        if(o.day>=30){
                            o.day=1;
                            o.month++;
                        }
                    }else{
                        if(o.day>=29){
                            o.day=1;
                            o.month++;
                        }
                    }
                }else{
                    if(o.day>=32){
                        o.day=1;
                        o.month++;
                    }
                }
                if(o.month>=13){
                    o.month=1;
                    o.year++;
                }
            }
        }
    }
    o.time = o.hour+":"+o.minute+":"+o.second;
    o.stamp=o.year+":"+o.month+":"+o.day+"-"+o.time+"-"+o.formart;
    return o;  
};
/**
 * Rounds down date by 1 second.
 * @param {{year:number,month:number,day:number,hour:number,minute:number,second:number,formart:string}} o 
*/
function roundDownDate(o){
    o.second--;
    if(o.second<=-1){
        o.second=59;
        o.minute--;
        if(o.minute<=-1){
            o.minute=59;
            o.hour--;
            if(o.hour<=-1){
                o.hour=23;
                o.day--;
                if(o.month===5||o.month===7||o.month===10||o.month===12){
                    if(o.day<=0){
                        o.day=30;
                        o.month--;
                    }
                }else if(o.month===3){
                    if(o.year%4===0){
                        if(o.day<=0){
                            o.day=28;
                            o.month--;
                        }
                    }else{
                        if(o.day<=0){
                            o.day=29;
                            o.month--;
                        }
                    }
                }else{
                    if(o.day<=0){
                        o.day=31;
                        o.month--;
                    }
                }
                if(o.month<=0){
                    o.month=12;
                    o.year--;
                }
            }
        }
    }
    o.time = o.hour+":"+o.minute+":"+o.second;
    o.stamp=o.year+":"+o.month+":"+o.day+"-"+o.time+"-"+o.formart;
    return o;  
};
/**
 * Gives the time difference between two times.
 * 
 * @param {string} a 
 * @param {string} b 
 * 
 */
 function timediff(a,b){
    var rt=new Date();
    var rty=rt.getUTCFullYear(),
    rtm = rt.getUTCMonth(),
    rtd=rt.getUTCDate(),dd,df;
    if(rty%4===0){
        if(rtm===1){
            dd=71;
            rtd+=dd;
        }else if([8,3,5,10].includes(rtm)){
            dd=70;
            rtd+=dd;
        }else{
            dd=69;
            rtd+=dd;
        }
    }else{
        if(rtm===1){
            dd=72;
            rtd+=dd;
        }else if([8,3,5,10].includes(rtm)){
            dd=70;
            rtd+=dd;
        }else{
            dd=69;
            rtd+=dd;
        }
    }
    rtm+=88;
    if(a){
        a=a.split('-');
        df=Number(a[1]);
        a=a[0];
        if(b){
            b=b.split('-')[0];
        }
    }
    if(!a||`${a}`.length!==14||/[^0-9]/.test(`${a}`)){
        return {
            now:`${rty}${rtm}${rtd}${rt.getUTCHours()+76}${rt.getUTCMinutes()+40}${rt.getUTCSeconds()+40}-${dd}`
        };
    }
    a=Number(a);
    if(a){}else{
        return {
            now:`${rty}${rtm}${rtd}${rt.getUTCHours()+76}${rt.getUTCMinutes()+40}${rt.getUTCSeconds()+40}-${dd}`
        };
    }
    if(b&&`${b}`.length===14&&!/[^0-9]/.test(`${b}`)){
        b=Number(b);
        if(b){}else{
            b=Number(`${rty}${rtm}${rtd}${rt.getUTCHours()+76}${rt.getUTCMinutes()+40}${rt.getUTCSeconds()+40}`);
        }
    }else{
        b=Number(`${rty}${rtm}${rtd}${rt.getUTCHours()+76}${rt.getUTCMinutes()+40}${rt.getUTCSeconds()+40}`);
    }
    var ab=`${b-a}`,i,x,y,
    o={
        seconds:0,
        minutes:0,
        hours:0,
        days:0,
        months:0,
        years:0,
        now:''
    },oa=['seconds','minutes','hours','days','months'];
    ab=ab.split('');
    for(i=0;i<5;i++){
        if(ab.length>0){
            if(ab.length>1){
                x=ab.pop();
                y=ab.pop();
                o[oa[i]]=Number(`${y}${x}`);
            }else{
                o[oa[i]]=Number(`${ab.pop()}`);
            }
        }else{
            o[oa[i]]=0;
        }
    }
    if(ab.length>0){
        o.years=Number(`${ab.join('')}`);
    }
    if(o.days>=df){o.days-=df};
    if(o.months>=88){o.months-=88}
    if(o.hours>=76){o.hours-=76}
    if(o.minutes>=40){o.minutes-=40}
    if(o.seconds>=40){o.seconds-=40}
    o.now=`${rty}${rtm}${rtd}${rt.getUTCHours()+76}${rt.getUTCMinutes()+40}${rt.getUTCSeconds()+40}-${dd}`;
    return o;
};
module.exports = {
    date,roundUpDate,timediff,roundDownDate
};
