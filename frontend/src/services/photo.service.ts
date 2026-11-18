import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../environments/environment";


@Injectable({ providedIn: 'root' })
export class PhotoService {

    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    uploadPhoto(file: File|Blob, filename?: string): Observable<any> {
        const formData = new FormData();
        const finalName = filename || `photo-${Date.now()}.jpg`;

        formData.append('file', file, finalName);
        formData.append('uuid', crypto.randomUUID());

        return this.http.post(this.apiUrl + '/photo', formData)
    }
}