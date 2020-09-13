import {Component, OnInit, OnDestroy, ChangeDetectorRef} from '@angular/core';
import {Subscription, interval} from 'rxjs';
import {EmailsApiService} from './emails/emails-api.service';
import {Email} from './emails/email.model';
import {FormGroup, FormControl} from '@angular/forms';
import {Router, NavigationEnd} from '@angular/router';
import {Location} from '@angular/common';
import {filter} from 'rxjs/operators';
import {Title} from "@angular/platform-browser";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'app';
  emailsListSubs: Subscription;
  emailsList: Email[];
  
  public progress = '0';
  public uploadDisabled = "";
  public videoSrc = "assets/static.mp4";
  public progressHidden = "true";
  
  form = new FormGroup({
     email: new FormControl(),
});

  uploadForm = new FormGroup({
	file: new FormControl(),
});

  constructor(private emailsApi: EmailsApiService, private titleService: Title, private router: Router, private cd: ChangeDetectorRef) {
	  this.titleService.setTitle("flowky");
  }

  ngOnInit() {
		
	  this.router.events
		  .pipe(
			filter(e => e instanceof NavigationEnd)
		  )
		  .subscribe( (navEnd:NavigationEnd) => {
				if (navEnd.urlAfterRedirects === "/how"){
					this.scrollTo(1);
				}
				else if (navEnd.urlAfterRedirects === "/demo"){
					this.scrollTo(2);
				}
		  });
  }

  ngOnDestroy() {
    this.emailsListSubs.unsubscribe();
  }
  
  onSubmit(f){
	this.emailsApi.addEmail(f.email);
  }
  
  onFileChange(event) {
	  let reader = new FileReader();
	 
	  if(event.target.files && event.target.files.length) {
		const [file] = event.target.files;
		reader.readAsDataURL(file);
	  
		reader.onload = () => {
		  this.uploadForm.patchValue({
			file: reader.result
		  });
		  
		  // need to run CD since file load runs outside of zone
		  this.cd.markForCheck();
		  
		  this.progressHidden = "false";
		  this.uploadDisabled = "true";
		  
		  this.emailsApi.uploadFile(file)
		  .subscribe((id) =>{
			  
			const sub = interval(500)
				.subscribe(() => {
					this.emailsApi.getStatus(id).subscribe((data) => {

						  if (data == "0"){
						      this.emailsApi.getProgress(id).subscribe((data)=>{
								  this.progress = data;
							  });
						  }
						  else{
							  sub.unsubscribe();
							  this.progress = '0';
							  this.progressHidden = "true";
							  this.uploadDisabled = "";
							  this.videoSrc = "../../../backend/saves/" + id + ".mp4";
						  }
					});
				});
			});
	  }
	  }
}
  
  submitted(i){
	  i.value = "";
  }
  
  scrollTo(i) {
	
	if (i === 1){
		(document.querySelector('#how') as HTMLElement).scrollIntoView({behavior:"smooth"});
	}
	else if (i === 2){
		(document.querySelector('#demo') as HTMLElement).scrollIntoView({behavior:"smooth"});
	}
}
	  
}