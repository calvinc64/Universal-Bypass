if(document instanceof HTMLDocument)
{
	let injectionCode=()=>{
		let ODP=(t,p,o)=>{
			try
			{
				Object.defineProperty(t,p,o)
			}
			catch(e)
			{
				console.warn("Universal Bypass failed to set property",e)
			}
		},sT=window.setTimeout,sI=window.setInterval,ev=window.eval,// Note that we *need* to use eval for some bypasses to work and it's no security risk because this script is executed at page level which can be seen at https://playground.timmyrs.de/universal-bypass-exploit
		isGoodLink=link=>link&&link!=location.href&&link.substr(0,11)!="javascript:",
		navigated=false,safelyNavigate=target=>{
			if(!navigated&&isGoodLink(target))
			{
				bypassed=true
				navigated=true
				debugger
				let url
				try{url=new URL(target)}catch(e){}
				if(!url||!url.hash)
					target+=location.hash
				window.onbeforeunload=null
				location.href=target
			}
		},
		bypassed=false,//We keep track if we have already executed a bypass to stop further checks
		setBypassed=()=>{
			bypassed=true
			document.documentElement.setAttribute("data-universal-bypass-stop-watching","")
		},
		domainBypass=(domain,func)=>{
			if(!bypassed&&(location.hostname==domain||location.hostname.substr(location.hostname.length-(domain.length+1))=="."+domain))
			{
				func()
				setBypassed()
			}
		},
		hrefBypass=(hrefregex,func)=>{
			if(!bypassed&&hrefregex.test(location.href))
			{
				func()
				setBypassed()
			}
		},
		ensureDomLoaded=func=>{
			if(["interactive","complete"].indexOf(document.readyState)>-1)
				func()
			else document.addEventListener("DOMContentLoaded",()=>sT(func,1))
		},
		crowdOptIn=false,//
		crowdBypass=callback=>ensureDomLoaded(()=>{
			if(location.href.substr(location.href.length-18)=="#ignoreCrowdBypass")
			{
				let fs=document.querySelectorAll("form[action]")
				for(let i=0;i<fs.length;i++)
					fs[i].action+="#ignoreCrowdBypass"
				let ls=document.querySelectorAll("a[href]")
				for(let i=0;i<ls.length;i++)
					ls[i].href+="#ignoreCrowdBypass"
				history.pushState({},document.querySelector("title").textContent,location.href.substr(0,location.href.length-18))
				callback()
				return
			}
			let xhr=new XMLHttpRequest()
			xhr.onreadystatechange=()=>{
				if(xhr.readyState==4&&xhr.status==200&&xhr.responseText!="")
				{
					debugger
					location.href="https://universal-bypass.org/crowd-bypassed?target="+encodeURIComponent(xhr.responseText)+"&back="+encodeURIComponent(location.href)//The background script will intercept the request and redirect to html/crowd-bypassed.html because we can't redirect to extension urls in this scope.
				}
				else if(crowdOptIn)
					callback()
			}
			xhr.open("POST","https://universal-bypass.org/crowd/query_v1",true)
			xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded")
			xhr.send("domain="+encodeURIComponent(domain)+"&path="+encodeURIComponent(location.pathname.toString().substr(1)))
		}),
		contributeAndNavigate=target=>{
			if(navigated||!isGoodLink(target))
				return
			if(!crowdOptIn)
			{
				navigated=true
				debugger
				location.href=target
				return
			}
			let xhr=new XMLHttpRequest()
			xhr.onreadystatechange=()=>{
				if(xhr.readyState==4)
				{
					navigated=true
					debugger
					location.href=target
				}
			}
			xhr.open("POST","https://universal-bypass.org/crowd/contribute_v1",true)
			xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded")
			xhr.send("domain="+encodeURIComponent(domain)+"&path="+encodeURIComponent(location.pathname.toString().substr(1))+"&target="+encodeURIComponent(target))
		},
		domain=location.hostname
		if(domain.substr(0,4)=="www.")
			domain=domain.substr(4)
		ODP(this,"blurred",{
			value:false,
			writable:false
		})
		ODP(this,"ysmm",//Adf.ly
		{
			set:r=>{
				let a,m,I="",X=""
				for(m=0;m<r.length;m++)
					if(m%2==0)I+=r.charAt(m);else X=r.charAt(m)+X
				r=I+X
				a=r.split("")
				for(m=0;m<a.length;m++)
				{
					if(!isNaN(a[m]))
					{
						for(var R=m+1;R<a.length;R++)
						{
							if(!isNaN(a[R]))
							{
								let S=a[m]^a[R]
								if(S<10)a[m]=S
									m=R
								R=a.length
							}
						}
					}
				}
				r=a.join('')
				r=window.atob(r)
				r=r.substring(r.length-(r.length-16))
				r=r.substring(0,r.length-16)
				if(r&&(r.indexOf("http://")===0||r.indexOf("https://")===0))
					safelyNavigate(r)
			}
		})
		//LinkBucks
		var actualInitLbjs
		ODP(this,"initLbjs",{
			set:(_)=>actualInitLbjs=_,
			get:()=>(a,p)=>{
				p.Countdown--
				actualInitLbjs(a,p)
			}
		})
		//Safelink
		let actual_safelink=forced_safelink={counter:0}
		ODP(this,"safelink",
		{
			set:_=>{
				ODP(window,"blurred",{
					value:false,
					writable:false
				})
				for(let k in _)
				{
					let v=_[k]
					if(forced_safelink[k]===undefined)
						actual_safelink[k]=v
				}
			},
			get:()=>actual_safelink
		})
		for(let key in forced_safelink)
		{
			ODP(safelink,key,
			{
				writable:false,
				value:forced_safelink[key]
			})
		}
		//YetiShare
		let actual_web_root
		ODP(this,"WEB_ROOT",{
			set:v=>{
				ODP(this,"seconds",{
					value:0,
					writable:false
				})
				actual_web_root=v
			},
			get:()=>actual_web_root
		})
		hrefBypass(/ur\.ly|urly\.mobi/,()=>{
			if(location.pathname.length>2&&location.pathname.substr(0,6)!="/goii/")
				safelyNavigate("/goii/"+location.pathname.substr(2)+"?ref="+location.hostname+location.pathname)
		})
		domainBypass("cshort.org",()=>{
			ODP(this,"adblock",{
				value:false,
				writable:false
			})
			ODP(this,"i",{
				value:0,
				writable:false
			})
			ensureDomLoaded(()=>
			{
				let lT=sI(()=>
				{
					if(document.querySelector(".next[href]"))
					{
						clearInterval(lT)
						safelyNavigate(atob(atob(document.querySelector(".next[href]").getAttribute("href"))))
					}
				},100)
			})
		})
		domainBypass("link.tl",()=>{
			ODP(this,"countdown",{
				value:0,
				writable:false
			})
			let lT=sI(()=>
			{
				if(document.querySelector(".skip > .btn"))
				{
					clearInterval(lT)
					document.querySelector(".skip > .btn").click()
				}
			},100)
		})
		domainBypass("onepiece-ex.com.br",()=>{
			ODP(this,"seconds",{
				value:1,
				writable:false
			})
			let lT=sI(()=>{
				if(document.getElementById("continuar"))
				{
					clearInterval(lT)
					safelyNavigate(document.getElementById("continuar").href)
				}
			},100)
		})
		domainBypass("akoam.net",()=>{
			ODP(this,"timer",{
				value:0,
				writable:false
			})
			let lT=sI(()=>{
				if(document.querySelector(".download_button"))
				{
					clearInterval(lT)
					safelyNavigate(document.querySelector(".download_button").href)
				}
			},100)
		})
		hrefBypass(/1v\.to\/t\/.*/,()=>{
			location.pathname=location.pathname.split("/t/").join("/saliendo/")
		})
		domainBypass("share-online.biz",()=>{
			ODP(this,"wait",{
				set:s=>0,
				get:()=>{
					return 2
				}
			})
		})
		hrefBypass(/sfile\.(mobi|xyz)/,()=>{
			ODP(this,"downloadButton",{
				set:b=>{
					if(b&&b.href)
						safelyNavigate(b.href)
				}
			})
		})
		domainBypass("mylink.zone",()=>{
			ODP(this,"seconde",{
				set:_=>{},
				get:()=>{
					return -1
				}
			})
		})
		domainBypass("sourceforge.net",()=>{
			var b=document.createElement("button"),d=false
			b.className="direct-download"
			b.style.display="none"
			document.documentElement.appendChild(b)
			ODP(this,"log",{
				value:m=>{
					console.log(m)
					if(m=="triggering downloader:start")
						d=true
				},
				writable:false
			})
			ensureDomLoaded(()=>{
				let bT=sI(()=>{
					if(d)
						clearInterval(bT)
					else b.click()
				},100)
			})
		})
		domainBypass("bc.vc",()=>{
			window.setInterval=f=>sI(f,800)
			crowdBypass(()=>{
				window.eval=c=>{
					let j=ev(c)
					if(j.message&&j.message.url)
					{
						contributeAndNavigate(j.message.url)
						return{}
					}
					return j
				}
			})
			let sT=setInterval(()=>{
				let a=document.querySelector(".skip_btt > #skip_btt")
				if(a)
				{
					clearInterval(sT)
					a.click()
				}
			},50)
		})
		domainBypass("shortly.xyz",()=>{
			if(location.pathname.substr(0,3)=="/r/")
				document.getElementById=()=>({submit:()=>{
					let f=document.querySelector("form")
					f.action="/link#"+document.querySelector("input[name='id']").value
					f.submit()
				}})
			else if(location.pathname=="/link")
			{
				let xhr=new XMLHttpRequest()
				xhr.onreadystatechange=()=>{
					if(xhr.readyState==4&&xhr.status==200)
						safelyNavigate(xhr.responseText)
				}
				xhr.open("POST","https://www.shortly.xyz/getlink.php",true)
				xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded")
				xhr.setRequestHeader("X-Requested-With","XMLHttpRequest")
				xhr.send("id="+location.hash.replace("#",""))
			}
		})
		if(bypassed)
			return
		ensureDomLoaded(()=>{
			if(document.documentElement.hasAttribute("data-crowd-bypass-opt-in")||!document.documentElement.hasAttribute("data-crowd-bypass-opt-out"))
				crowdOptIn=true
			domainBypass("adfoc.us",()=>{
				let b=document.querySelector(".skip[href]")
				if(b)
					safelyNavigate(b.href)
			})
			domainBypass("sub2unlock.com",()=>{
				$(document).ready(()=>{
					let steps=document.querySelectorAll(".uk.unlock-step-link.check")
					if(steps.length)
					{
						for(let i in steps)
							if(i!=0&&steps[i] instanceof HTMLElement&&steps[i].className.substr(0,3)=="uk ")
								steps[i].className = steps[i].className.substr(3)
							steps[0].removeAttribute("target")
							steps[0].setAttribute("href","#")
							steps[0].click()
							document.getElementById("link").click()
						}
					})
			})
			domainBypass("srt.am",()=>{
				if(document.querySelector(".skip-container"))
				{
					let f=document.createElement("form")
					f.method="POST"
					f.innerHTML='<input type="hidden" name="_image" value="Continue">'
					f=document.documentElement.appendChild(f)
					f.submit()
				}
			})
			domainBypass("admy.link",()=>{
				let f=document.querySelector(".edit_link")
				if(f)
					f.submit()
			})
			domainBypass("ysear.ch",()=>{
				let b=document.querySelector("#NextVideo[href]")
				if(b)
					safelyNavigate(b.href)
			})
			domainBypass("1ink.cc",()=>{
				if(typeof SkipAd=="function")
					SkipAd()
			})
			domainBypass("losstor.com",()=>{
				let b=document.getElementById("re_link")
				if(b)
				{
					window.open=safelyNavigate
					b.click()
				}
			})
			domainBypass("bagisoft.net",()=>{
				let b=document.getElementById("makingdifferenttimer")
				if(b)
				{
					window.open=safelyNavigate
					b.click()
				}
				else
					jQuery.prototype.animateProgress=(p,f)=>f()
			})
			domainBypass("skinnycat.net",()=>{
				let b=document.querySelector("#dl[href]")
				if(b)
					safelyNavigate(b.href)
			})
			domainBypass("fshare.vn",()=>{
				if("$" in window)
				{
					let f=$("#form-download")
					if(f.length)
					{
						$.ajax({
							"url":f.attr("action"),
							"type":"POST",
							"data":f.serialize()
						}).done(data=>safelyNavigate(data.url))
					}
				}
			})
			domainBypass("dwindly.io",()=>{
				//We trick the site into running window.open for the target site by executing an onclick handler.
				let b=document.getElementById("btd1")
				if(b)
				{
					window.open=()=>{}
					b.click()
				}
				else
				{
					b=document.getElementById("btd")
					if(b)
					{
						window.open=safelyNavigate
						ev("("+b.onclick.toString().split(";")[0]+"})()")
					}
				}
			})
			domainBypass("bluemediafiles.com",()=>{
				if(typeof FinishMessage=="string"&&FinishMessage.indexOf("<a href=")>-1)
				{
					//The FinishMessage string contains the HTML anchor element needed to get to the destination so we just replace the entire website with it because we don't need any of the other content anymore.
					document.write(FinishMessage)
					document.querySelector("a").click()
				}
			})
			domainBypass("complete2unlock.com",()=>{
				if(["/","/home","/create","/settings"].indexOf(location.pathname)==-1&&location.pathname.substr(0,5)!="/api/"&&location.pathname.substr(0,6)!="/edit/")
					safelyNavigate("/api/links/complete"+location.pathname)
			})
			domainBypass("hidelink.club",()=>{
				if(hash)
					safelyNavigate(decodeURIComponent(atob(hash)).replace("%23", "#"))
			})
			domainBypass("won.pe",()=>
			{
				if(document.querySelector(".captcha_loader .progress-bar"))
					document.querySelector(".captcha_loader .progress-bar").setAttribute("aria-valuenow","100")
			})
			domainBypass("stealive.club",()=>{
				if(document.getElementById("counter"))
					document.getElementById("counter").innerHTML="0"
			})
			hrefBypass(/((binerfile|pafpaf)\.info)|(kurosafety\.menantisenja\.com)/,()=>{//KuroSafe
				let b=document.querySelector("#mybutton[href]")
				if(b)
					safelyNavigate(b.href)
			})
			domainBypass("gotoo.loncat.in",()=>{
				let a=document.querySelector("a[href^='http://gotoo.loncat.in/go.php?open=']")
				if(a)
					safelyNavigate(a.href)
			})
			domainBypass("id-share19.com",()=>window.setTimeout=(f)=>sT(f,1))
			domainBypass("idnation.net",()=>{
				let b=document.querySelector("#linko[href]")
				if(b)
					safelyNavigate(b.href)
			})
			domainBypass("mazika2day.com",()=>{
				let b=document.querySelector(".linkbtn[href]")
				if(b)
					safelyNavigate(b.href)
			})
			domainBypass("ux9.de",()=>{
				let m=document.querySelector("meta[http-equiv='refresh'][content]")
				if(m&&m.getAttribute("content").indexOf(";url=http")>-1)
				safelyNavigate(m.getAttribute("content").split(";url=")[1])
			})
			domainBypass("telolet.in",()=>{
				let b=document.querySelector("a#skip[href]")
				if(!b)
					b=document.querySelector(".redirect_url > a[href]")
				if(b)
					safelyNavigate(b.href)
			})
			domainBypass("vipdirect.cc",()=>{
				if(typeof ab=="number"&&typeof asdf=="function")
				{
					ab=5
					window.open=safelyNavigate
					asdf()
				}
			})
			domainBypass("rapidcrypt.net",()=>{
				let b=document.querySelector(".push_button.blue[href]")
				if(b)
					safelyNavigate(b.href)
			})
			domainBypass("oke.io",()=>{
				window.setInterval=f=>sI(f,1)
			})
			domainBypass("shrink-service.it",()=>{
				if(typeof $=="function"&&typeof $.ajax=="function"&&typeof screenApi=="function")
				{
					let _a=$.ajax
					$.ajax=a=>(a.data&&a.data.set_one?safelyNavigate(atob(a.data.set_one)):_a(a))
					screenApi()
				}
			})
			domainBypass("rom.io",()=>crowdBypass(()=>{
				let cT=setInterval(()=>{
					let a=document.querySelector("a.final-button[href]")
					if(a&&isGoodLink(a.href))
					{
						clearInterval(cT)
						a.parentNode.removeChild(a)
						contributeAndNavigate(a.href)
					}
				},50)
			}))
			if(bypassed)
				return
			//Adf.ly Pre-Redirect Nonsense
			if(location.pathname.substr(0,13)=="/redirecting/"&&document.querySelector("p[style]").textContent=="For your safety, never enter your password unless you're on the real Adf.ly site.")
			{
				let a=document.querySelector("a[href]")
				if(a)
					safelyNavigate(a.href)
				return setBypassed()
			}
			if(typeof app_vars=="object")
			{
				//SafelinkU
				if(document.querySelector("b[style='color: #3e66b3']")&&document.querySelector("b[style='color: #3e66b3']").textContent=="SafelinkU")
				{
					window.setInterval=(f)=>sI(f,10)
					return setBypassed()
				}
				//AdLinkFly
				document.documentElement.setAttribute("data-universal-bypass-adlinkfly-info","")
				let iT=setInterval(()=>{
					if(document.documentElement.hasAttribute("data-universal-bypass-adlinkfly-target"))
					{
						clearInterval(iT)
						let t=document.documentElement.getAttribute("data-universal-bypass-adlinkfly-target")
						if(t=="crowd")
							crowdBypass(()=>{
								let cT=setInterval(()=>{
									let a=document.querySelector("a.get-link[href]")
									if(!a)
										a=document.querySelector(".skip-ad a[href]")
									if(a&&isGoodLink(a.href))
									{
										clearInterval(cT)
										a.parentNode.removeChild(a)
										contributeAndNavigate(a.href)
									}
								},50)
							})
						else contributeAndNavigate(t)
					}
			},50)
				return setBypassed()
			}
			//GemPixel Premium URL Shortener
			if(typeof appurl!="undefined"&&typeof token!="undefined")
			{
				//For this bypass to work, we detect a certain inline script, modify and execute it.
				let scripts=document.getElementsByTagName("script")
				for(let i in scripts)
				{
					let script=scripts[i]
					if(script instanceof HTMLScriptElement)
					{
						let cont=script.textContent
						if(cont.indexOf('clearInterval(countdown);')>-1)
						{
							if(typeof countdown!="undefined")
								clearInterval(countdown)
							if(!document.querySelector("a.redirect"))
							{
								let a=document.createElement("a")
								a.href="#"
								a.className="redirect"
								document.documentElement.appendChild(a)
							}
							if(cont.indexOf("var count = ")>-1)
							{
								cont=cont.split(/var count = [0-9]*;/).join("let count=0;")
							}
							else
							{
								cont="let count=0;"+cont
							}
							cont=cont.split("$(window).on('load', ").join("let r=f=>f();r(")
							window.setInterval=f=>f()
							ev(cont)
							window.setInterval=sI
							safelyNavigate(document.querySelector("a.redirect").href)
							return setBypassed()
						}
						else if(cont.trim().substr(0,69)=='!function(a){a(document).ready(function(){var b,c=a(".link-content"),')
						{
							safelyNavigate(cont.trim().substr(104).split('",e=0,f=a(".count-timer"),g=f.attr("data-timer"),h=setInterval(')[0])
							return setBypassed()
						}
					}
				}
				if(document.getElementById("messa")&&document.getElementById("html_element"))//Ally Captcha
				{
					document.getElementById("messa").className+=" hidden"
					document.getElementById("html_element").className=document.getElementById("html_element").className.split("hidden").join("").trim()
					return setBypassed()
				}
			}
			//Soralink Wordpress Plugin
			if(document.querySelector(".sorasubmit"))
			{
				document.querySelector(".sorasubmit").click()
				return setBypassed()
			}
			if(document.querySelector("#lanjut > #goes[href]"))
			{
				safelyNavigate(document.querySelector("#lanjut > #goes[href]").href)
				return setBypassed()
			}
			if(document.getElementById("waktu")&&document.getElementById("goto"))
			{
				safelyNavigate(document.getElementById("goto").href)
				return setBypassed()
			}
			if(typeof bukalink=="function"&&document.getElementById("bijil1")&&document.getElementById("bijil2"))//gosavelink.com
			{
				window.open=safelyNavigate
				bukalink()
				return setBypassed()
			}
			if(typeof changeLink=="function")
			{
				let cLT=sI(()=>{
					if((document.querySelectorAll("img#pleasewait").length&&document.querySelector(".wait"))
						||document.getElementById("showlink")
						||document.getElementById("download")
						||document.getElementsByTagName("style='margin-top:").length
						||document.querySelector(".Visit_Link")//yametesenpai.xyz
						||document.getElementById("daplong")//converthinks.xyz
						)
					{
						clearInterval(cLT)
						window.open=safelyNavigate
						if(typeof changeLink=="function")
							changeLink()
						else if(document.getElementById("link-download"))//hightech.web.id
							safelyNavigate(document.getElementById("link-download").href)
					}
				},100)
			}
			//Safelink Wordpress Plugin
			if(document.querySelector(".wp-safelink-button"))
			{
				window.setInterval=f=>sI(f,1)
				let lT=sI(()=>{
					if(document.querySelector(".wp-safelink-button.wp-safelink-success-color"))
					{
						clearInterval(lT)
						window.open=safelyNavigate
						document.querySelector(".wp-safelink-button.wp-safelink-success-color").click()
					}
				},100)
			}
			if(document.getElementById("wpsafe-generate")&&typeof wpsafegenerate=="function")
			{
				let search=location.search.toString().replace("?", "")
				if(search.substr(0,3)=="go=")
				{
					search=atob(search.substr(3))
					if(search.substr(0,4)=="http")
					{
						safelyNavigate(search)
						return setBypassed()
					}
				}
				else if(location.pathname.toString().substr(0,4)=="/go/")
				{
					search=atob(location.pathname.toString().substr(4))
					if(search.substr(0,4)=="http")
					{
						safelyNavigate(search)
						return setBypassed()
					}
				}
			}
			if(document.querySelector("input[type='hidden'][name='newwpsafelink'][value]")&&location.search&&location.search.substr(0,4)=="?go=")
			{
				safelyNavigate(atob(location.search.substr(4).split("&")[0]))
				return setBypassed()
			}
			//Other Templates
			if(document.querySelector("#tungguyabro")&&typeof WaktunyaBro=="number")//short.mangasave.me
			{
				WaktunyaBro=0
				setInterval(()=>{
					if(document.querySelector("#tungguyabro a[href]"))
						safelyNavigate(document.querySelector("#tungguyabro a[href]").href)
				},100)
				return setBypassed()
			}
			if(document.querySelector("#yangDihilangkan > a")&&document.querySelector("#downloadArea > .text-center"))//rathestation.bid
			{
				safelyNavigate(document.querySelector("#yangDihilangkan > a").href)
				return setBypassed()
			}
			if(document.querySelector("a#btn-main.disabled")&&typeof Countdown=="function")//Croco,CPMLink,Sloomp.space
			{
				safelyNavigate(document.querySelector("a#btn-main.disabled").href)
				return setBypassed()
			}
			if(document.querySelector("a.redirectBTN.disabled")&&document.querySelector(".timer"))//Arablionz.online
			{
				safelyNavigate(document.querySelector("a.redirectBTN.disabled").href)
				return setBypassed()
			}
			if(document.querySelector(".shortened_link a[href][ng-href][target='_blank']"))//Go2to.com,Go2too.com,Golink.to
			{
				safelyNavigate(document.querySelector(".shortened_link a[href][ng-href][target='_blank']").href)
			}
			if(document.querySelector("form#skip")&&document.getElementById("btn-main")&&!document.querySelector(".g-recaptcha"))
			{
				document.querySelector("form#skip").submit()
				return setBypassed()
			}
			if(document.getElementById("countdown")&&document.querySelector(".seconds"))
			{
				let doBypass=!0
				domainBypass("mexashare.com",()=>doBypass=!1)
				domainBypass("up-4.net",()=>doBypass=!1)
				domainBypass("file-upload.com",()=>doBypass=!1)
				if(doBypass)
					document.querySelector(".seconds").textContent="0"
				return setBypassed()
			}
			if(document.querySelector("#ddl #download_link .btn"))
			{
				window.open=safelyNavigate
				document.querySelector("#ddl #download_link > .btn").click()
				return setBypassed()
			}
			if(typeof file_download=="function")
			{
				window.setInterval=f=>sI(f,1)
				return setBypassed()
			}
			if(document.querySelector("input[type=\"submit\"][name=\"method_free\"]"))
			{
				document.querySelector("input[type=\"submit\"][name=\"method_free\"]").click()
				return setBypassed()
			}
			if(document.getElementById("frmdlcenter")&&document.getElementById("pay_modes"))//elsfile.org Timer
			{
				let form=document.createElement("form")
				form.method="POST"
				form.innerHTML='<input type="hidden" name="op" value="download1"><input type="hidden" name="usr_login" value="C"><input type="hidden" name="id" value="'+location.pathname.toString().substr(1)+'"><input type="hidden" name="fname" value="'+document.querySelectorAll("div#container > div > div > table > tbody > tr > td")[2].textContent+'"><input type="hidden" name="referer" value="q"><input type="hidden" name="method_free" value="Free Download">'
				form=document.documentElement.appendChild(form)
				form.submit()
				return setBypassed()
			}
			if(document.querySelector("a[href^='https://linkshrink.net/homepage'] > img.lgo"))//LinkShrink.net
			{
				let p=document.getElementById("pause"),s=document.getElementById("skip")
				if(p&&s)
				{
					//Automating the click seems to not always work due to ads so we're only skipping the timer
					p.style.display="none"
					s.style.display="block"
				}
			}
			if(document.querySelector(".img-responsive[alt='Gets URL']")&&typeof x!="undefined")//GetsURL.com
			{
				let b=document.getElementById("link")
				if(b)
				{
					safelyNavigate(b.href+"&ab"+x)
					return setBypassed()
				}
			}
			if(document.querySelector(".top-bar a[href='https://linkvertise.net']")&&typeof app!="undefined"&&app.handleRedirect)//Linkvertise.net
			{
				app.countdown=0
				$.post=(u,c)=>c()
				app.handleRedirect()
			}
			if(document.querySelectorAll("img[src='/assets/img/logo.png'][alt='Openload']").length)//OpenLoad
			{
				if(typeof secondsdl!="undefined")
					secondsdl=0
				return setBypassed()
			}
			//SafeLinkReview.com
			if(document.querySelector(".navbar-brand")&&document.querySelector(".navbar-brand").textContent.trim()=="Safe Link Review"&&document.querySelector(".button.green"))
			{
				window.open=safelyNavigate
				document.querySelector(".button.green").click()
				return setBypassed()
			}
			if(location.hostname=="decrypt2.safelinkconverter.com"&&document.querySelector(".redirect_url > div[onclick]"))
			{
				window.open=safelyNavigate
				document.querySelector(".redirect_url > div[onclick]").click()
				return setBypassed()
			}
			let t=document.querySelector("title")
			if(t)
			{
				if(t.textContent.trim()=="Viid.su")//Viid.su
				{
					let b=document.getElementById("link-success-button")
					if(b&&b.getAttribute("data-url"))
					{
						safelyNavigate(b.getAttribute("data-url"))
						return setBypassed()
					}
				}
			}
			setBypassed()
			let dT=sI(()=>{//Monitor DOM for other disturbances for 10 seconds.
				if(document.querySelector(".lay-sh.active-sh"))//Shorte.st Embed
				{
					let elm=document.querySelectorAll(".lay-sh.active-sh")[0]
					elm.parentNode.removeChild(elm)
				}
			},100)
			setTimeout(()=>clearInterval(dT),10000)
		})
	},//
	//This method of injecting the script is faster than any interfering extensions in most cases
	injectScript=text=>{
		let script=document.createElement("script")
		script.innerHTML=text
		script=document.documentElement.appendChild(script)
		setTimeout(()=>document.documentElement.removeChild(script),10)//Removing the script again after it's been executed to keep the DOM clean
	},
	ensureDomLoaded=func=>{
		if(["interactive","complete"].indexOf(document.readyState)>-1)
			func()
		else document.addEventListener("DOMContentLoaded",()=>func())
	}
	injectScript("("+injectionCode.toString()+")()")//
	chrome.storage.sync.get(["crowd_bypass_opt_out"],result=>ensureDomLoaded(()=>document.documentElement.setAttribute("data-crowd-bypass-opt-"+(result&&result.crowd_bypass_opt_out&&result.crowd_bypass_opt_out==="true"?"out":"in"),"")))
	ensureDomLoaded(()=>{
		let dT=setInterval(()=>{
			if(document.documentElement.hasAttribute("data-universal-bypass-adlinkfly-info"))
			{
				document.documentElement.removeAttribute("data-universal-bypass-adlinkfly-info")
				let xhr=new XMLHttpRequest(),t="",iu=location.href
				xhr.onreadystatechange=()=>{
					if(xhr.readyState==4)
					{
						if(xhr.status==200)
						{
							t="crowd"
							let i=new DOMParser().parseFromString(xhr.responseText,"text/html").querySelector("img[src^='//api.miniature.io']")
							if(i)
							{
								let url=new URL(i.src)
								if(url.search&&url.search.indexOf("url="))
									t=decodeURIComponent(url.search.split("url=")[1].split("&")[0])
							}
						}
						document.documentElement.setAttribute("data-universal-bypass-adlinkfly-target",t)
					}
				}
				if(iu.substr(iu.length-1)!="/")
					iu+="/"
				xhr.open("GET",iu+"info",true)
				xhr.send()
			}
			if(document.documentElement.hasAttribute("data-universal-bypass-stop-watching"))
			{
				clearInterval(dT)
				document.documentElement.removeAttribute("data-universal-bypass-stop-watching")
			}
		},50)
	})
	chrome.storage.local.get(["custom_bypasses"],result=>{
		ensureDomLoaded(()=>{
			if(result&&result.custom_bypasses)
			{
				let customBypasses=JSON.parse(result.custom_bypasses)
				for(let name in customBypasses)
				{
					let customBypass=customBypasses[name]
					if(customBypass.domains=="*")
						injectScript(customBypass.content)
					else
					{
						let domains=customBypass.domains.split(",")
						for(let i in domains)
						{
							let domain=domains[i]
							if(location.hostname==domain||location.hostname.substr(location.hostname.length-(domain.length+1))=="."+domain)
								injectScript(customBypass.content)
						}
					}
				}
			}
		})
	})
}
