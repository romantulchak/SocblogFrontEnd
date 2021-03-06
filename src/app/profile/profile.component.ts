import { Component, OnInit, OnDestroy } from '@angular/core';
import { TokenStorageService } from '../services/token-storage.service';
import { Router, ActivatedRoute, RouterOutlet } from '@angular/router';
import { User } from '../model/user.model';
import { ProfileService } from '../services/profile.service';
import { DialogService } from '../services/dialog.service';
import { RxStompService } from '@stomp/ng2-stompjs';
import { PostService } from '../services/post.service';
import { SearchService } from '../services/search.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {


  constructor(private searchService: SearchService, private tokenStorage: TokenStorageService,private postService: PostService, private activeRouter: ActivatedRoute, private router:Router, private profileService: ProfileService, private dialogService: DialogService, private rxStompService: RxStompService) {

      this.activeRouter.params.subscribe(
        res=>{
          this.getUserData();
        }
      );
   }
   public currentUser: User;
  private userLoggedIn: User;
  public notificationCounter: number;
  public loaded: boolean = false;
  ngOnInit(): void {
    this.userLoggedIn = this.tokenStorage.getUser();
    this.currentUser = this.tokenStorage.getUser();
    if(this.currentUser != null){
      this.getUserData();
    }
  }



  private getUserData(){
    this.loaded = false;
    if(this.userLoggedIn != null){

      this.profileService.getUserData(this.userLoggedIn.id).subscribe(
        res=>{
          this.currentUser = res;
          this.tokenStorage.globalCurrentUser = res;
          //this.profileService.user.next(res);

          if(res.isNew){
            this.router.navigateByUrl('/profile/settings');
          }
          setTimeout(() => {
            this.loaded = true;
          }, 2000);
        }
      );

    }
  }






}
