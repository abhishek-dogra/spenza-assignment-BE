import { Injectable } from '@nestjs/common';

@Injectable()
export class CommonService {
  mapper<Source, Destination>(source: Source, destination: any): Destination {
    for (const property in source) {
      if (destination.hasOwnProperty(property)) {
        if (typeof source[property] === 'object') {
          if (source[property] == null) {
            destination[property] = destination[property] || null;
          } else if (destination[property] == null) {
            destination[property] = source[property];
          } else {
            destination[property] = destination[property] || {};
            this.mapper(source[property], destination[property]);
          }
        } else {
          destination[property] = source[property];
        }
      }
    }
    return destination;
  }
}
