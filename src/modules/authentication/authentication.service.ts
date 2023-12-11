import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateSessionTokenDto,
  CreateUserDto,
  CreateSessionWithOAuth2Dto,
  ChangePasswordDto,
  UpdateAuthDto,
  CreateAdminSessionTokenDto,
  AdminIndexAuthenDto,
} from './authentication.dto';
import { AuthenticationRepository } from './authentication.repository';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { IPagination } from '../../adapters/pagination/pagination.interface';
import { getHeaders } from '../../adapters/pagination/pagination.helper';
import {
  createTimeStringWithFormat,
  db2api,
  decodeJWTToken,
} from '../../shared/helpers';
import { Role } from '../../shared/constant';
import { isValidObjectId } from 'mongoose';
import { OAuthClient, privateKey } from './authentication.const';
import { OAuthService } from './oauth.service';
import { IAuth } from './authentication.interface';
import { ObjectId } from 'bson';
import { v4 as uuidv4 } from 'uuid';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly authenticationRepository: AuthenticationRepository,
    private readonly oauthService: OAuthService,
    private readonly mailService: MailService,
  ) {}
  async createUser(
    createAuthenticationDto: CreateUserDto,
    role: Role = Role.Client,
  ) {
    const findParams: any = {};
    const cond = [];
    if (createAuthenticationDto.mail) {
      cond.push({ mail: createAuthenticationDto.mail });
    }
    if (createAuthenticationDto.phone) {
      cond.push({ phone: createAuthenticationDto.phone });
    }
    findParams.$or = cond;
    const user = await this.authenticationRepository.findOne(findParams);
    if (user) {
      throw new BadRequestException('Người dùng đã tồn tại');
    }

    if (role === Role.Root) {
      throw new BadRequestException('Không thể tạo người dùng root');
    }

    const password = createAuthenticationDto.password;

    const newUser = await this.authenticationRepository.create({
      ...createAuthenticationDto,
      password: await bcrypt.hash(password, 10),
      registerToken: uuidv4(),
      isActive: false,
      role,
    });

    await this.mailService.sendRequestActiveAccount(newUser);

    return 'SUCCESS';
  }

  async registerUser(token: string) {
    const user = await this.authenticationRepository.findOne({
      registerToken: token,
    });
    if (!user) {
      throw new NotFoundException(`Không tìm thấy ngừoi dùng`);
    }
    user.isActive = true;
    return this.authenticationRepository.updateById(user.id, {
      ...user,
    });
  }

  async createSession(createSessionDto: CreateSessionTokenDto) {
    const findParams: any = {};
    if (createSessionDto.mail) {
      findParams.mail = createSessionDto.mail;
    }
    const user = await this.authenticationRepository.findOne(findParams);

    if (!user) {
      throw new BadRequestException(
        'Địa chỉ mail hoặc mật khẩu của người dùng không hợp lệ',
      );
    }

    if (!user.isActive) {
      throw new BadRequestException('Tài khoản hiện tại đã bị vô hiệu hóa');
    }

    const isMatch = await bcrypt.compare(
      createSessionDto.password,
      user.password,
    );

    if (!isMatch) {
      throw new BadRequestException(
        'Địa chỉ mail hoặc mật khẩu của người dùng không hợp lệ',
      );
    }

    const { accessToken, refreshToken } = await this.createSessionToken({
      id: user.id,
      role: user.role,
      name: user.fullname,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 10 * 60 * 1000,
      refreshExpiresIn: 24 * 60 * 60 * 1000,
    };
  }

  async createAdminSession(createSessionDto: CreateAdminSessionTokenDto) {
    const findParams: any = {};
    if (createSessionDto.mail) {
      findParams.userName = createSessionDto.mail;
    }
    findParams.role = { $in: [Role.Root, Role.Admin] };
    let user = await this.authenticationRepository.findOne(findParams);

    if (!user) {
      throw new BadRequestException(
        'Tên tài khoản hoặc mật khẩu của người dùng không hợp lệ',
      );
    }

    if (!user.isActive) {
      throw new BadRequestException('Tài khoản hiện tại đã bị vô hiệu hóa');
    }

    const isMatch = await bcrypt.compare(
      createSessionDto.password,
      user.password,
    );

    if (!isMatch) {
      throw new BadRequestException(
        'Tên tài khoản hoặc mật khẩu của người dùng không hợp lệ',
      );
    }

    user = await this.authenticationRepository.updateById(user.id, {
      sessionToken: new ObjectId().toString(),
    });

    const { accessToken, refreshToken } = await this.createSessionToken({
      id: user.id,
      role: user.role,
      name: user.fullname,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 10 * 60 * 1000,
      refreshExpiresIn: 24 * 60 * 60 * 1000,
    };
  }

  async refreshSession(token: string) {
    const { userId, isRefresh } = decodeJWTToken(token);
    if (!isRefresh) {
      throw new BadRequestException('Token không phải token làm mới');
    }
    const user = await this.authenticationRepository.findById(userId);

    if (!user) {
      throw new BadRequestException('Tài khoản không tồn tại');
    }
    if (!user.isActive) {
      throw new BadRequestException('Tài khoản hiện tại đã bị vô hiệu hóa');
    }

    const accessToken = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      privateKey,
      {
        expiresIn: '10m',
      },
    );

    return { accessToken, expiresIn: 10 * 60 * 1000 };
  }

  async findAll(
    adminIndexAuthenDto: AdminIndexAuthenDto,
    pagination?: IPagination,
  ) {
    const findParam: any = {};
    const cond = [];
    if (adminIndexAuthenDto.search) {
      cond.push({ mail: adminIndexAuthenDto.search });
      cond.push({ phone: adminIndexAuthenDto.search });
      findParam.$or = cond;
    }
    if (adminIndexAuthenDto.role) {
      findParam.role = adminIndexAuthenDto.role;
    }
    if (adminIndexAuthenDto.isActive) {
      findParam.isActive = adminIndexAuthenDto.isActive;
    }
    const count = await this.authenticationRepository.count(findParam);
    const list = await this.authenticationRepository.find(
      findParam,
      {
        skip: pagination.startIndex,
        limit: pagination.endIndex,
      },
      { createdAt: -1 },
    );

    const paginationHeader = getHeaders(pagination, count);
    return {
      items: db2api(list),
      headers: { ...paginationHeader },
    };
  }

  async getUserById(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('id must be valid object id');
    }
    const user = await this.authenticationRepository.findById(id);

    if (!user) {
      throw new BadRequestException('Tài khoản không tồn tại');
    }

    return db2api<IAuth, IAuth>(user);
  }

  async deleteListUserId(ids: string[]) {
    const arr = [];
    ids.forEach((id) => {
      if (isValidObjectId(id)) {
        arr.push(new ObjectId(id));
      }
    });
    if (arr.length > 0) {
      return this.authenticationRepository.delete({ _id: { $in: arr } });
    }
  }

  async createSessionWithOAuth2(
    createSessionDto: CreateSessionWithOAuth2Dto,
    role: Role = Role.Client,
  ) {
    const { base, token, redirect_uri } = createSessionDto;
    const isAuthenticate = await this.oauthService.verifyIdToken(
      base,
      token,
      redirect_uri,
    );
    if (!isAuthenticate) {
      throw new BadRequestException('Đăng nhập với OAuth thất bại');
    }
    const userInfo = await this.oauthService.getUserInfo(
      base,
      base === OAuthClient.GOOGLE ? isAuthenticate : token,
    );
    const findParams: any = {};
    if (base === OAuthClient.GOOGLE) {
      findParams.ggId = userInfo.id;
    } else {
      findParams.fbId = userInfo.id;
    }
    let user = await this.authenticationRepository.findOne(findParams);
    let isNewUser = false;

    if (!user) {
      const payload: IAuth = {
        ...findParams,
        fullname: userInfo.name,
        mail: userInfo.email,
        avatar: userInfo.avatar,
      };
      if (userInfo.birthday) {
        payload.birthday = userInfo.birthday;
      }
      if (userInfo.gender) {
        payload.gender = userInfo.gender;
      }

      const newUser = await this.authenticationRepository.create({
        ...payload,
        role,
      });
      isNewUser = true;
      user = newUser;
    }

    const { accessToken, refreshToken } = await this.createSessionToken({
      id: user.id,
      role: user.role,
      name: user.fullname,
    });

    return {
      isNewUser,
      accessToken,
      refreshToken,
      expiresIn: 10 * 60 * 1000,
      refreshExpiresIn: 24 * 60 * 60 * 1000,
    };
  }

  async updateOAuth(
    createSessionDto: CreateSessionWithOAuth2Dto,
    userId: string,
  ) {
    const { base, token } = createSessionDto;
    const isAuthenticate = await this.oauthService.verifyIdToken(base, token);
    if (!isAuthenticate) {
      throw new BadRequestException('Xác thực OAuth thất bại');
    }
    const userInfo = await this.oauthService.getUserInfo(
      base,
      base === OAuthClient.GOOGLE ? isAuthenticate : token,
    );
    const findParams: any = {};
    if (base === OAuthClient.GOOGLE) {
      findParams.ggId = userInfo.id;
    } else {
      findParams.fbId = userInfo.id;
    }

    const user = await this.authenticationRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('Không tìm thấy ngừoi dùng');
    }
    let payload: IAuth = {
      ...findParams,
      fullname: userInfo.name,
      mail: userInfo.email,
      avatar: userInfo.avatar,
    };
    if (userInfo.birthday) {
      payload.birthday = createTimeStringWithFormat(userInfo.birthday);
    }
    if (userInfo.gender) {
      payload.gender = userInfo.gender;
    }
    payload = { ...user, ...payload };

    return !this.authenticationRepository.updateById(userId, { ...findParams });
  }

  async changePassword({ password, newPassword }: ChangePasswordDto, userId) {
    const user = await this.authenticationRepository.findById(userId);

    if (!user) {
      throw new BadRequestException('Không tìm thấy ngừoi dùng');
    }

    if (!user.password) {
      return this.authenticationRepository.updateById(userId, {
        password: await bcrypt.hash(newPassword, 10),
      });
    }
    if (!password) {
      throw new BadRequestException('Mật khẩu không đúng');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new BadRequestException('Mật khẩu không đúng');
    }

    return this.authenticationRepository.updateById(userId, {
      password: await bcrypt.hash(newPassword, 10),
    });
  }

  async updateAuthInfo(updateAuthDto: UpdateAuthDto, userId: string) {
    const user = await this.authenticationRepository.findById(userId);

    if (!user) {
      throw new BadRequestException('Không tìm thấy ngừoi dùng');
    }

    return this.authenticationRepository.updateById(userId, {
      ...updateAuthDto,
    });
  }

  async deleteOAuthInfo({ base }, userId: string) {
    const user = await this.authenticationRepository.findById(userId);

    if (!user) {
      throw new BadRequestException('Không tìm thấy ngừoi dùng');
    }
    const updateParam: any = {};
    if (base === OAuthClient.GOOGLE) {
      updateParam.ggId = '';
    } else {
      updateParam.fbId = '';
    }
    return this.authenticationRepository.updateById(userId, updateParam);
  }

  async createSessionToken({ id, role, name }) {
    const accessToken = jwt.sign(
      { userId: id, userName: name, role },
      privateKey,
      {
        expiresIn: '10m',
      },
    );

    const refreshToken = jwt.sign({ userId: id, isRefresh: true }, privateKey, {
      expiresIn: '1d',
    });

    return { accessToken, refreshToken };
  }
}
