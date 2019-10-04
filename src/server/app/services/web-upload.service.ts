import { Injectable, HttpStatus } from '@nestjs/common';
import * as fs from 'fs';
import { Folder } from '@shared/interface/folder.int';
import * as shortUid from 'short-uuid';
import { WinLogger } from '@common/logger/winlogger';
import { TechnicalException } from '@common/exception/technical.exception';
import { Config } from '@config/config';
import { FunctionalException } from '@common/exception/functional.exception';

@Injectable()
export class WebUploadService {

  private static FOLDERS_CONFIG = `${Config.get().SERVER_DATA}/folders.json`;

  folders: Folder[];

  nginxTemplate: string;

  private logger = WinLogger.get('web-upload-service');

  constructor() {
    this.readFoldersJson();
  }

  /**
   * Allow to create folder
   * @param folder
   */
  public async createFolder(folder: Folder) {
    const path = folder.path;
    try {
      if (!fs.existsSync(path)) {
        await fs.promises.mkdir(path, { recursive: true });
      }
    } catch (err) {
      throw new TechnicalException('folder-access', `Unabled to create folder "${path}"`, err);
    }

    folder.reference = shortUid.generate();
    this.folders.push(folder);
    this.saveFoldersJson();

    return folder.reference;
  }

  /**
   * Allow to update folder
   * @param folder
   */
  public updateFolder(folder: Folder) {
    const oldFolder = this.getFolder(folder.reference);

    if (!oldFolder) {
      throw new TechnicalException('folder-not-found', `No folder found with reference "${folder.reference}"`, HttpStatus.NOT_FOUND);
    }

    Object.assign(oldFolder, folder);

    this.saveFoldersJson();

    return folder.reference;
  }

  /**
   * Allow to delete folder
   * @param reference
   */
  public deleteFolder(reference: string) {
    const filteredFolder = this.folders.filter(folderToFilter => {
      return folderToFilter.reference !== reference;
    });

    if (filteredFolder.length === this.folders.length) {
      throw new FunctionalException('folder-not-found', `Folder with the reference "${reference}" not found`);
    }

    this.saveFoldersJson();
  }

  /**
   * Allow to get a folder
   * @param reference
   */
  public getFolder(reference: string): Folder {
    return this.folders.find(f => f.reference === reference);
  }

  /**
   * Allow to list folders
   */
  public listFolders(): Folder[] {
    return this.folders;
  }

  /**
   * Allow to upload a file inside a folder
   * @param file the file
   * @param reference the folder reference
   */
  public async uploadFile(file: any, reference: string) {
    const folder = this.getFolder(reference);
    const path = folder.path;

    // Récupérer le nom du fichier
    const fileName = file.originalname;
    try {
      await fs.promises.writeFile(path + '/' + fileName, file.buffer);
    } catch (err) {
      throw new TechnicalException('write-file', `Unabled to write file "${file.originalname}" into "${path}"`, err);
    }
    this.logger.info(` ${file.originalname} copied into ${path}`);
  }

  private saveFoldersJson() {
    fs.writeFileSync(WebUploadService.FOLDERS_CONFIG, JSON.stringify(this.folders));
  }

  private readFoldersJson() {
    try {
      const folders = fs.readFileSync(WebUploadService.FOLDERS_CONFIG, 'utf8');
      if (folders) {
        this.folders = JSON.parse(folders);
      }
    } catch (err) {
      this.logger.error('Unabled to read folders list', err);
      this.folders = [];
    }
  }
}
