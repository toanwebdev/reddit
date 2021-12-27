import { Alert, AlertIcon, AlertTitle, Box, Button, Flex, Link, Spinner } from "@chakra-ui/react"
import { Form, Formik, FormikHelpers } from "formik"
import { useRouter } from "next/router"
import { useState } from "react"
import InputField from "../components/InputField"
import Wrapper from "../components/Wrapper"
import { ChangePasswordInput, MeDocument, MeQuery, useChangePasswordMutation } from "../generated/graphql"
import { mapFieldErrors } from "../helpers/mapFieldErrors"
import NextLink from 'next/link'
import { useCheckAuth } from "../utils/useCheckAuth"

const ChangePassword = () => {
  const router = useRouter()

  const {data: authData, loading: authLoading} = useCheckAuth()
  const initialValues = {newPassword: ''}
  
  const [changePassword] = useChangePasswordMutation()
  const [tokenError, setTokenError] = useState('');

  const onChangePasswordSubmit = async (values: ChangePasswordInput, { setErrors }: FormikHelpers<ChangePasswordInput>) => {
    if(router.query.userId && router.query.token) {
      const response = await changePassword ({
        variables: {
          userId: parseInt(router.query.userId as string),
          token: router.query.token as string,
          changePasswordInput: values
        },
        update(cache, { data }) {
          if (data?.changePassword.success) {
            cache.writeQuery<MeQuery>({
              query: MeDocument,
              data: { me: data.changePassword.user },
            })
          }
        },
      })

      if(response.data?.changePassword.errors) {
        const fieldErrors = mapFieldErrors(response.data.changePassword.errors)
        if('token' in fieldErrors) {
          setTokenError(fieldErrors.token)
        }
        setErrors(fieldErrors)
      } else if(response.data?.changePassword.user) {
        router.push('/')
      }
    }
  }

  return (
    <>
      {authLoading || (!authLoading && authData?.me) ? (
        <Flex justifyContent='center' alignItems='center' minHeight='100vh'>
          <Spinner />
        </Flex>
      ):(
          <>
            {(!router.query.token || !router.query.userId) ? (
                <Wrapper size='small'>
                  <Alert status='error'>
                    <AlertIcon />
                    <AlertTitle>Invalid password change request</AlertTitle>
                  </Alert>
                  <Flex mt={2}>
										<NextLink href='/login'>
											<Link ml='auto'>Back to login</Link>
										</NextLink>
									</Flex>
                </Wrapper>
              ) : (
                <Wrapper>
                  <Formik initialValues={initialValues} onSubmit={onChangePasswordSubmit}>
                    {({ isSubmitting }) => (
                      <Form>
                        <Box mt={4}>
                          <InputField
                            name='newPassword'
                            placeholder='New Password'
                            label='New Password'
                            type='password'
                          />
                        </Box>
                        {tokenError && 
                          <Flex>
                            <Box color='red' mr={2}>{tokenError}</Box>
                            <NextLink href='/forgot-password'>
                              <Link>Go back to Forgot Password</Link>
                            </NextLink>
                          </Flex>
                        }
                        <Button
                          type='submit'
                          colorScheme='teal'
                          mt={4}
                          isLoading={isSubmitting}>
                          Change Password
                        </Button>
                      </Form>
                    )}
                  </Formik>
                </Wrapper>
              )
            }
          </>
        )
      }
    </>
  )
}

export default ChangePassword
