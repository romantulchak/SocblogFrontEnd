import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { PostService } from '../services/post.service';
import { Post } from '../model/post.model';
import { NotificationService } from '../services/notification.service';
import { Tag } from '../model/tag.model';
import { TagService } from '../services/tag.service';
import { User } from '../model/user.model';
import { TokenStorageService } from '../services/token-storage.service';
import { RichTextEditor, Toolbar, Link, Image, HtmlEditor, QuickToolbar } from '@syncfusion/ej2-richtexteditor';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
RichTextEditor.Inject(Toolbar, Link, HtmlEditor, Image, QuickToolbar);
import {map, startWith} from 'rxjs/operators';
import { MatChipInputEvent } from '@angular/material/chips';
import { RxStompService } from '@stomp/ng2-stompjs';
import { NgxImageCompressService } from 'ngx-image-compress';
import { CompressImage } from '../services/compressImage.service';
@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent implements OnInit {

  public htmlContent = '';
  public post: Post = new Post();
  public tags: Tag[];
  public user:User;
  @Input() editPost: Post;
  public image: File;
  public imageSettings: any;
  public allowChangeSmallDescription: boolean = false;

  public tag: Tag = new Tag();

  public imagePathPreview;
  public selectable = true;
  public removable = true;
  public separatorKeysCodes: number[] = [ENTER, COMMA];
  public fruitCtrl = new FormControl();
  public filterTags: Observable<string[]>;
  public taggs: string[] = [];
  public tagNames: string[] = [];


  @ViewChild('fruitInput') fruitInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;










  constructor(private compressImage:CompressImage,  private storageToken: TokenStorageService,private imageCompress: NgxImageCompressService, private tagService: TagService, private postService: PostService, private notificationService: NotificationService) {
    this.imageSettings = {
      saveFormat: "Base64"
      };
      this.post.text = '';
  }


  public tools: object = {
    items: ['Undo', 'Redo', '|',
        'Bold', 'Italic', 'Underline', 'StrikeThrough', '|',
        'FontName', 'FontSize', 'FontColor', 'BackgroundColor', '|',
        'SubScript', 'SuperScript', '|',
        'LowerCase', 'UpperCase', '|',
        'Formats', 'Alignments', '|', 'OrderedList', 'UnorderedList', '|',
        'Indent', 'Outdent', '|', 'CreateLink',
        'Image', '|', 'ClearFormat', 'SourceCode', '|', 'FullScreen']
};




  ngOnInit(): void {
    if(this.storageToken.globalCurrentUser != null){
    this.user = this.storageToken.globalCurrentUser;
    }else{
      this.user = this.storageToken.getUser();
    }
    if(this.editPost != null){
      this.imagePathPreview = this.editPost.image;

    }


    this.getTags();
  }


  public createPost(){
    this.post.user.id = this.user.id;
    this.taggs.forEach(t=>{
      this.post.tags.push(this.tags.find(x=>x.name === t));
    });
    this.postService.createPost(this.post, this.image).subscribe(
      res=>{
        this.notificationService.success(res);
      }
    );
  }

  public getTags(){
    this.tagService.getTags().subscribe(
      res=>{
        if(res != null){
          this.tags = res;

          res.forEach(el=>{

            this.tagNames.push(el.name);
          });
          if(this.editPost != null){
            this.tags.forEach(el=>{
              for (let index = 0; index < this.editPost.tags.length; index++) {
                if(this.editPost.tags[index].name === el.name){
                  el.myInterest = true;
                  break;
                }
              }
            });
          }
          this.filterTags = this.fruitCtrl.valueChanges.pipe(
            startWith(null),
            map((tag: string | null) => tag ? this._filter(tag) : this.tagNames.slice()));
        }
      }
    );
  }

  public fileUpload(event:any){
    this.imageCompress.uploadFile().then(({image, orientation})=>{
      this.imageCompress.compressFile(image,orientation,80, 90 ).then(
        result=>{
          this.imagePathPreview = image;
          this.image = new File([this.compressImage.b64toBlob(result)], 'post__main_image.jpg');
        }
      )
    });
  }


  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;


    if ((value || '').trim()) {
      this.taggs.push(value.trim());
    }

    if (input) {
      input.value = '';
    }

    this.fruitCtrl.setValue(null);
  }


  remove(fruit: string): void {
    const index = this.taggs.indexOf(fruit);

    if (index >= 0) {
      this.taggs.splice(index, 1);
    }
  }
  selected(event: MatAutocompleteSelectedEvent): void {
    this.taggs.push(event.option.viewValue);

    this.fruitInput.nativeElement.value = '';
    this.fruitCtrl.setValue(null);
  }
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.tagNames.filter(tag => tag.toLowerCase().indexOf(filterValue) === 0);
  }

  public setSmallDescription(){
    setTimeout(() => {
      this.post.smallDescription = this.post.text.replace(/<[^>]*>/g, '').slice(0, 500).toString();
      this.notificationService.success('Small description was created but you can change it');

    this.allowChangeSmallDescription = true;

    }, 500);
  }

  public createTag(){

     this.tag.user = new User();
    this.tag.name = this.tag.name.replace(/\s/g, "");
    this.tag.user.id = this.user.id;

    this.tagService.createTag(this.tag, this.user.id).subscribe(
      res=>{
        this.getTags();
        this.notificationService.success(res);
      }
    );
  }

  public edit(){
    this.editPost.createdDate = null;
    this.postService.editPost(this.editPost, this.image).subscribe(
      res=>{
        this.notificationService.success("Ok");
      },
      err=>{
        this.notificationService.error(err);
      }
    );
  }
}
